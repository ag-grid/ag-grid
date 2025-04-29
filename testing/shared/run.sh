#!/bin/bash

set -eu

editor=false
mode=docker
interactive=false
update=false
production=false
it_opts=
passthrough_opts=

function sed_inplace {
    if [[ $(uname) == "Darwin" ]] ; then
        sed -i '' "$@"
    else
        sed -i'' "$@"
    fi
}

function snapshot_versions {
    if ${production} ; then
        grep 'ag-grid-' package.json >./e2e/${fw}-${version}-${patch_subdir:-basic}-version.txt
        grep ${fw_package} package.json >>./e2e/${fw}-${version}-${patch_subdir:-basic}-version.txt
    fi
}

while getopts ":o:eniupc" opt; do
  case $opt in
    o)
      overrides_subdir="$OPTARG"
      passthrough_opts="${passthrough_opts} -o ${overrides_subdir}"
      ;;
    e)
      editor=true
      ;;
    c)
      mode=container
      ;;
    n)
      mode=native
      ;;
    p)
      production=true
      passthrough_opts="${passthrough_opts} -p"
      ;;
    u)
      update=true
      passthrough_opts="${passthrough_opts} -u"
      ;;
    i)
      interactive=true
      passthrough_opts="${passthrough_opts} -i"
      it_opts=-it
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$opt requires an argument." >&2
      exit 1
      ;;
  esac
done
shift $((OPTIND - 1))

version=$1
project=${2:-/project}

if [[ ${mode} == "container" ]] ; then
    echo ">>> using prepared temporary project folder..."
    cd ${project}
else
    echo ">>> preparing temporary project folder..."
    repo_dir=$(git rev-parse --show-toplevel)
    project_dir=$(readlink -f $(dirname $0))
    project_script=$(basename $0)

    project=$(mktemp -d)

    cp -R ${project_dir}/../shared/* $project/
    cp -R ${project_dir}/* $project/
    cp dist/artifacts/packages/*.tgz $project/

    if [[ ${overrides_subdir:-} != "" ]] ; then
        echo ">>> copying overrides from ${overrides_subdir}"
        cp -R ${project_dir}/overrides/${overrides_subdir}/* $project/
    fi

    cd ${project_dir}
    sed -e '/source .*\/run.sh$/r ../shared/run.sh' ${project_dir}/${project_script} >${project}/run.sh
    sed_inplace -e '/source .*\/run.sh$/d' ${project}/run.sh
    cd ${project}

    echo ">>> temporary project folder: ${project}"
fi

if ${editor} ; then
  code=`which code | wc -l | xargs`
  if [[ ${code} == 0 ]] ; then
    idea . &
  else
    code . &
  fi
fi

if [[ ${mode} == "docker" ]] ; then
    echo ">>> docker run ..."
    port_spec=
    if ${interactive} ; then
        port_spec="-p ${dev_port}:${dev_port}"
    fi
    mkdir -p ./npm-cache
    docker run ${it_opts} --rm --ipc=host \
        -v $(pwd):/project \
        $port_spec \
        mcr.microsoft.com/playwright:v1.45.0-jammy \
        /bin/bash -il /project/run.sh -c ${passthrough_opts} ${version} /project
    exitCode=$?

    if ${update} ; then
        cp -R */e2e/*-snapshots ${project_dir}/e2e/
#        cp */e2e/*.txt ${project_dir}/e2e/ || true
    fi

    exit ${exitCode}
fi

cache_location="${project}/.npm-cache"
echo "cache_location: $cache_location"
install_fw

if ${production} ; then
    echo ">>> npm i ag-grid-${fw} (production)"
    npm i ag-grid-${fw} @playwright/test@1.45.0 --cache ${cache_location}
else
    echo ">>> npm i ../ag-grid*.tgz"
    npm i ../ag-grid-community.tgz ../ag-grid-enterprise.tgz ../ag-grid-${fw}.tgz @playwright/test@1.45.0 --cache ${cache_location} --registry http://52.50.158.57:4873
fi

patch_dir=../patches
if [[ "${patch_subdir:-}" != "" ]] ; then
    patch_dir=${patch_dir}/${patch_subdir}
fi
for filename in ${patch_dir}/* ; do
    if [ ! -f "$filename" ] ; then
        continue
    fi

    ext=${filename##*.}

    if [[ ${ext} == 'sed' ]] ; then
        target=$(find . -not \( -path ./node_modules -prune \) -name "$(basename ${filename%.*})" -type f)
        echo ">>> Modifying ${target}"
        sed_inplace -f $filename $(pwd)/$target
    else
        target=$(find . -not \( -path ./node_modules -prune \) -name "$(basename $filename)" -type f)
        echo ">>> Updating ${target}"
        cp $filename $target
    fi
done

patch_fw

mv ../e2e ../playwright.config.ts ./

export FW_VERSION=${version}
export FW_TYPE=${fw}
export FW_DEV_PORT=${dev_port}
export FW_VARIANT=${overrides_subdir:-}
if ${production} ; then
    export FW_VERSION=production-$FW_VERSION
fi
if [[ "${patch_subdir:-}" != "" ]] ; then
    export FW_PATCH_TYPE=${patch_subdir}
fi

build_fw

if ${interactive} ; then
    serve_fw
    npx playwright test $(${update} && echo "-u" || echo "") || echo "Tests failed"
    /bin/bash -il
else
    echo ">>> playwright test"
    npx playwright test $(${update} && echo "-u" || echo "")
fi

snapshot_versions

if [[ ${mode} == 'native' && ${update} == 'true' ]] ; then
    cp -R */e2e/*-snapshots ${project_dir}/e2e/
    cp */e2e/*.txt ${project_dir}/e2e/ || true
fi


