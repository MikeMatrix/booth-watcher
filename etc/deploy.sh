#!/bin/bash

set -e

GIT_REPOSITORY=git@github-booth-watcher:pypy-vrc/booth-watcher
DEPLOY_PATH=/home/service/booth-watcher
DEPLOY_TIME=$(date +%Y%m%d%H%M%S)

echo ----- clone new release -----

mkdir -p $DEPLOY_PATH/releases
git clone --depth 1 -- $GIT_REPOSITORY $DEPLOY_PATH/releases/$DEPLOY_TIME

echo ----- install dependencies -----

cd $DEPLOY_PATH/releases/$DEPLOY_TIME
npm i

echo ----- build -----

npm run prod

echo ----- activate new release -----

ln -sf $DEPLOY_PATH/.env $DEPLOY_PATH/releases/$DEPLOY_TIME/.env
ln -sf $DEPLOY_PATH/known-item-ids.json $DEPLOY_PATH/releases/$DEPLOY_TIME/known-item-ids.json
ln -sfn $DEPLOY_PATH/releases/$DEPLOY_TIME $DEPLOY_PATH/current

echo ----- purge old releases -----

ls $DEPLOY_PATH/releases | head -n -2 | xargs -I {} -r rm -rf $DEPLOY_PATH/releases/{}
