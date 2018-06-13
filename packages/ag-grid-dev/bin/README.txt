
# to check out all projects into <folder> (create the folder first)
git-checkout-master <folder>

# to check out all projects into a branch, branch-name will be the folder name is uses
# not sure if folder needs to exists first or not (when you find out, update this note)
git-checkout-all-into-branch <branch-name>

# if doing dev, then create the links before your build
create-links

# runs 'npm install' and 'gulp abc' to build everything
build-dist-all

<or>

build-dist <proj1> <proj2>...
eg
build-dist ag-grid ag-grid-enterprise

then create links