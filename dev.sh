export BASE=$PWD

function dkup {
  CD=$(pwd)
  cd $BASE
  docker-compose up -d rabbit
  exitcode=$?
  cd $CD
  return $exitcode
}

function dkdown {
  CD=$(pwd)
  cd $BASE
  docker-compose down
  exitcode=$?
  cd $CD
  return $exitcode
}

function install_packages {
  dk "yarn install"
}

function dk {
  CD=$(pwd)
  cd $BASE
  docker-compose run --rm app $@
  exitcode=$?
  cd $CD
  return $exitcode
}
