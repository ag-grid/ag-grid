git remote add "$1" git@github.com:ag-grid/"$1".git
git fetch "$1"
git merge -s ours --no-commit --allow-unrelated-histories "$1"/master
git read-tree --prefix=packages/"$1"/ -u "$1"/master
git commit -m "Imported $1 as a subtree"

