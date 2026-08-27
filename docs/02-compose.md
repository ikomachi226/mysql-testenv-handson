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

`OCI lab`が1件表示されたら成功です。

Composeファイルは3306を`127.0.0.1`へだけバインドします。

ローカルPCから接続する場合は、SSHトンネルを使います。

```bash
ssh -i ~/.ssh/oci-lab.key -N -L 13306:127.0.0.1:13306 opc@<PUBLIC_IP>
```

初期化SQLは、データボリュームが空のときだけ実行されます。

SQLを書き換えた後に初期化をやり直す場合は、実習用のvolumeだけを確認して削除します。

```bash
podman compose down -v
podman compose up -d
```
