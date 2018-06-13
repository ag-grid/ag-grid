#!/usr/bin/env bash
current_dir=$(pwd)

# ag
#rm -rf ag-grid-enterprise/node_modules/ag-grid
#ln -s "$current_dir/ag-grid" ag-grid-enterprise/node_modules/ag-grid

# angular
#rm -rf ag-grid-angular/node_modules/ag-grid
#ln -s "$current_dir/ag-grid" ag-grid-angular/node_modules/ag-grid

# angular examples
projects=( "ag-grid" "ag-grid-enterprise" "ag-grid-angular" )
targets=( "ag-grid-angular-example/systemjs_aot" "ag-grid-angular-example/webpack" "ag-grid-angular-example/webpack2" "ag-grid-angular-example/angular-cli")
exclude=( "node_modules" )

for target in "${targets[@]}"
do
    for project in "${projects[@]}"
    do
        rm -rf $target/node_modules/$project
    done
done

# this is more complicated that simple linking of projects because some of the AOT compilers don't like nested node_modules
# what this does is link all file/foldes from the source project to destination, excluding node_modules (which wouldnt be installed
# via npm install anyway)
for project in "${projects[@]}"
do
    for file in "$project"/*;
    do
        for (( index = 0; index < ${#exclude[@]}; index++ ));
        do
            if [[ "${file}" == *"${exclude[${index}]}" ]]; then
                continue;
            fi

            for target in "${targets[@]}"
            do
                mkdir -p ${target}/node_modules/$project
                ln -s "$current_dir/${file}" ${target}/node_modules/${file}
            done
        done
    done
done

#rm -rf ag-grid-angular-example/systemjs_aot/node_modules/ag-grid
#ln -s "$current_dir/ag-grid" ag-grid-angular-example/systemjs_aot/node_modules/ag-grid

#rm -rf ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-enterprise
#ln -s "$current_dir/ag-grid-enterprise" ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-enterprise

#rm -rf ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-angular
#ln -s "$current_dir/ag-grid-angular" ag-grid-angular-example/systemjs_aot/node_modules/ag-grid-angular

