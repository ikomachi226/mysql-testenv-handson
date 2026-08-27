# Composeで公式MySQLイメージを起動する

この実習では、MySQL Community Serverの公式イメージをOracle Container Registryから取得します。

タグは`9.7`に固定します。

```bash
git clone <REPOSITORY_URL>
printf 'MYSQL_ROOT_PASSWORD=ChangeMe_OnlyForLab\nMYSQL_PORT=13306\n' > .env
chmod 600 .env

podman pull container-registry.oracle.com/mysql/community-server:9.7
```

`.env`の`MYSQL_ROOT_PASSWORD`を実習専用の値に変更します。

`.env`はGitに追加しません。

起動します。

```bash
podman compose up -d
podman compose ps
podman compose exec mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" \
  -e "SELECT * FROM labdb.todo;"
```

<img width="772" height="157" alt="image" src="https://github.com/user-attachments/assets/80a73142-09b3-4d4c-a559-bb2d5d47bb30" />

`OCI lab`が1件表示されたら成功です。

Composeファイルは3306を`127.0.0.1`へだけバインドします。

初期化SQL(01-schema.sql)は、データボリュームが空のときだけ実行されます。

SQLを自由に実行する場合は、SQLを指定せずに起動します。
```bash
podman compose exec mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" labdb
```
起動後は普通にSQLを実行できます。
```bash
//SQL例
SHOW TABLES;
INSERT INTO todo(title) VALUES ('manual data');
SELECT * FROM todo;
```
終了は exit です。手動で加えた変更はmysql-data volumeに残ります。
SQLを書き換えた後に初期状態へ戻したい場合は、以下を実行します。

```bash
podman compose down -v
podman compose up -d
```
