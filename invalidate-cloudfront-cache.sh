#!/usr/bin/env bash
#
# invalidate CloudFront's cache for the ag-grid.com
# distribution (E2SJ3W7448VC28)
#
# Defaults to invalidating EVERYTHING ("/*")
# paths can be invalidated with --paths <PATH>
#
#   ./invalidate-cloudfront-cache.sh                              # dry run, invalidates "/*"
#   ./invalidate-cloudfront-cache.sh --apply                      # invalidates "/*", waits for completion
#   ./invalidate-cloudfront-cache.sh --apply --paths "/images/*" "/example/*"
#
set -euo pipefail

DIST_ID="E2SJ3W7448VC28"

APPLY=0
PATHS=()

while [ $# -gt 0 ]; do
    case "$1" in
        --apply)
            APPLY=1
            shift
            ;;
        --paths)
            shift
            while [ $# -gt 0 ] && [[ "$1" != --* ]]; do
                PATHS+=("$1")
                shift
            done
            ;;
        -h | --help)
            sed -n '2,20p' "$0"
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

if [ "${#PATHS[@]}" -eq 0 ]; then
    PATHS=("/*")
fi

echo "== recent invalidations on ${DIST_ID} =="
aws cloudfront list-invalidations --distribution-id "$DIST_ID" \
    --query 'InvalidationList.Items[0:5].{Id:Id,Status:Status,CreateTime:CreateTime}' --output table 2>&1 || true
echo

echo "== distribution status =="
aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.Status' --output text
echo

echo "== planned invalidation =="
printf '  %s\n' "${PATHS[@]}"
echo

if [ "$APPLY" = "0" ]; then
    echo "== DRY RUN - nothing sent to CloudFront. Re-run with --apply to submit. =="
    exit 0
fi

REFERENCE="rollback-$(date -u +%Y%m%dT%H%M%SZ)"
echo "== submitting invalidation, reference: ${REFERENCE} =="

PATHS_JSON=$(printf '"%s",' "${PATHS[@]}")
PATHS_JSON="[${PATHS_JSON%,}]"

RESULT=$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" \
    --invalidation-batch "{\"Paths\":{\"Quantity\":${#PATHS[@]},\"Items\":${PATHS_JSON}},\"CallerReference\":\"${REFERENCE}\"}" \
    --output json)

INVALIDATION_ID=$(echo "$RESULT" | python3 -c "import json,sys; print(json.load(sys.stdin)['Invalidation']['Id'])")
echo "Created invalidation: ${INVALIDATION_ID}"
echo

echo "== waiting for it to complete (this typically takes a few minutes) - will not exit until it does =="
while true; do
    STATUS_OUTPUT=$(aws cloudfront get-invalidation --distribution-id "$DIST_ID" --id "$INVALIDATION_ID" --query 'Invalidation.Status' --output text 2>&1) && STATUS_ERR=0 || STATUS_ERR=$?
    if [ "$STATUS_ERR" -ne 0 ]; then
        if echo "$STATUS_OUTPUT" | grep -q "AccessDenied"; then
            echo
            echo "Cannot poll status: this identity lacks cloudfront:GetInvalidation."
            echo "The invalidation WAS submitted (id: ${INVALIDATION_ID}) but this script cannot confirm"
            echo "completion without that permission - run grant-cloudfront-invalidation-policy.sh first."
            exit 1
        fi
        echo "Unexpected error checking status: $STATUS_OUTPUT" >&2
        exit 1
    fi
    [ "$STATUS_OUTPUT" = "Completed" ] && break
    echo "  status: ${STATUS_OUTPUT}..."
    sleep 15
done

echo
echo "PASS: invalidation ${INVALIDATION_ID} completed for: ${PATHS[*]}"
echo "Every path listed will be re-fetched from origin on its next request."
