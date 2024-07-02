#!/usr/bin/env bash

# dumb repetitive and basic - can rework post release

excluded=("react" "vue3" "angular" "ag-grid-react" "ag-grid-vue3" "ag-grid-angular" "styles" "theming" "locale")

for directory in `ls community-modules`;
do
  if [[ ! ${excluded[@]} =~ $directory ]]
  then
    if [[ ! -d "community-modules/$directory/dist" ]]
    then
      echo "!!!!! community-modules/$directory/dist doesn't exist"
      exit 1
    fi

    count=`ls -l "community-modules/$directory/dist/package" | wc -l | tr -d ' '`;
    if [[ $count -ne 8 ]]
    then
      echo "!!!!! community-modules/$directory/dist/package should have 10 artefacts"
      exit 1
    else
      echo "community-modules/$directory/dist/package has $count artefacts"
    fi

    count=`tree "community-modules/$directory/dist/types" | grep .d.ts | wc -l | tr -d ' '`;
    if [[ $count -le 5 ]]
    then
      echo "!!!!! community-modules/$directory/dist/types should have at least 5 artefacts"
      exit 1
    else
      echo "community-modules/$directory/dist/types has $count artefacts"
    fi
  fi
done

for directory in `ls enterprise-modules`;
do
  if [[ ! ${excluded[@]} =~ $directory ]]
  then
    if [[ ! -d "enterprise-modules/$directory/dist" ]]
    then
      echo "!!!!! enterprise-modules/$directory/dist doesn't exist"
      exit 1
    fi

    count=`ls -l "enterprise-modules/$directory/dist/package" | wc -l | tr -d ' '`;
    if [[ $count -ne 8 ]]
    then
      echo "!!!!! enterprise-modules/$directory/dist/package should have 10 artefacts"
      exit 1
    else
      echo "enterprise-modules/$directory/dist/package has $count artefacts"
    fi

    count=`tree "enterprise-modules/$directory/dist/types" | grep .d.ts | wc -l | tr -d ' '`;
    if [[ $count -lt 3 ]]
    then
      echo "!!!!! enterprise-modules/$directory/dist/types should have at least 3 artefacts"
      exit 1
    else
      echo "enterprise-modules/$directory/dist/types has $count artefacts"
    fi
  fi
done

for directory in `ls packages`;
do
  if [[ ! ${excluded[@]} =~ $directory ]]
  then
    if [[ ! -d "packages/$directory/dist" ]]
    then
      echo "packages/$directory/dist doesn't exist"
      exit 1
    fi

    count=`ls -l "packages/$directory/dist/package" | wc -l | tr -d ' '`;
    if [[ $count -ne 8 ]]
    then
      echo "!!!!! packages/$directory/dist/package should have 10 artefacts"
      exit 1
    else
      echo "packages/$directory/dist/package has $count artefacts"
    fi

    count=`tree "packages/$directory/dist/types" | grep .d.ts | wc -l | tr -d ' '`;
    if [[ $count -le 5 ]]
    then
      echo "!!!!! packages/$directory/dist/types should have at least 5 artefacts"
      exit 1
    else
      echo "packages/$directory/dist/types has $count artefacts"
    fi
  fi
done

frameworks=("react" "vue3" "angular")
for framework in "${frameworks[@]}"
do
  if [[ ! -d "community-modules/$framework/dist" ]]
  then
    echo "community-modules/$framework/dist doesn't exist"
    exit 1
  fi

  count=`tree "community-modules/$framework/dist" | grep .d.ts | wc -l | tr -d ' '`;
  if [[ $count -le 5 ]]
  then
    echo "!!!!! community-modules/$framework/dist should have at least 5 artefacts"
    exit 1
  else
    echo "community-modules/$framework/dist has $count artefacts"
  fi
done

frameworks=("ag-grid-react" "ag-grid-vue3" "ag-grid-angular")
for framework in "${frameworks[@]}"
do
  if [[ ! -d "packages/$framework/dist" ]]
  then
    echo "packages/$framework/dist doesn't exist"
    exit 1
  fi

  count=`tree "packages/$framework/dist" | grep .d.ts | wc -l | tr -d ' '`;
  if [[ $count -le 5 ]]
  then
    echo "!!!!! packages/$framework/dist should have at least 5 artefacts"
    exit 1
  else
    echo "packages/$framework/dist has $count artefacts"
  fi
done

count=`ls -l packages/ag-grid-community/dist/*.js | wc -l | tr -d ' '`
if [[ $count -ne 4 ]]
then
  echo "!!!!! packages/ag-grid-community/dist should have 4 umd files"
  exit 1
fi
count=`ls -l packages/ag-grid-enterprise/dist/*.js | wc -l | tr -d ' '`
if [[ $count -ne 4 ]]
then
  echo "!!!!! packages/ag-grid-enterprise/dist should have 4 umd files"
  exit 1
fi
count=`ls -l packages/ag-grid-charts-enterprise/dist/*.js | wc -l | tr -d ' '`
if [[ $count -ne 4 ]]
then
  echo "!!!!! packages/ag-grid-charts-enterprise/dist should have 4 umd files"
  exit 1
fi
count=`find "community-modules/locale/dist/" | wc -l | tr -d ' '`
if [[ $count -ne 53 ]]
then
  echo "!!!!! community-modules/locale/dist should have 53 files"
  exit 1
fi
