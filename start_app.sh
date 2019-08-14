#! /bin/bash

# Store app dir
app_dir=$(pwd)

cd ${app_dir}/server && G_private_key=$G_private_key G_client_email=$G_client_email PORT=$PORT node app.js



