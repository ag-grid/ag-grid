grep -R --exclude-dir={node_modules,lib,dist,.cache,_dev,_gen} --include=\*.ts --include=\*.js --include=\*.tsx --include=\*.jsx  'debugger' . | awk '{$1=$1};1'

