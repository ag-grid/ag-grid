if [ "$#" -ne 1 ]
then
    echo "You must the release version as the first argument"
    exit 1
fi

TAG_NAME="release-$1"
git tag -s "$TAG_NAME" -m "Release $1"
git push origin "$TAG_NAME"
