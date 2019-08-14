#! /bin/bash

app_dir=$(pwd)

echo '---- Building Angular project ----'
cd ${app_dir}/frontend && ng build --aot --prod

echo '---- Copying compiled files over ----'
cp -r ${app_dir}/frontend/dist/* ${app_dir}/server/dist


