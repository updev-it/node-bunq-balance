#!/usr/bin/env bash
##
## Title:                     copy-data.sh
## Description:               
## Author:                    B. van wetten
## Created date:              05-03-2020
## Updated date:              05-03-2020
## Version:                   0.1.0
##
## Usage:                     copy-data.sh [path]

CID=$(docker create qnimbus/docker-bunq-balance:latest)
docker cp ${CID}:/usr/src/app/dist/public/accounts/. ${1:-.}
docker rm ${CID}