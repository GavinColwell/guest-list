#! /bin/bash

app_dir=$(pwd)

echo '---- Installing frontend dependencies ----'
cd ${app_dir}/frontend && npm install

echo '---- Installing server dependencies ----'
cd ${app_dir}/server && npm install
