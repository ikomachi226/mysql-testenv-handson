# SandboxでInnoDB Clusterを試す

Sandboxはコンテナではありません。

MySQL Shellが同一ホストにローカルmysqldを作成し、AdminAPIの検証用設定を準備します。

MySQL Yum RepositoryのOracle Linux 9向けリリースRPMを取得し、MySQL ServerとMySQL Shellを導入します。

```bash
cd /tmp
curl -LO https://repo.mysql.com/mysql97-community-release-el9.rpm
# ダウンロードしたmysql97-community-release-*-el9.noarch.rpmを指定する
sudo dnf install -y ./mysql97-community-release-el9.rpm
sudo dnf install -y mysql-community-server mysql-shell
which mysqld mysqlsh
mysqlsh --version
```

9.7系列が有効であることを確認してから、3つのSandboxを作成します。

```javascript
// mysqlsh --js
dba.deploySandboxInstance(3310)
dba.deploySandboxInstance(3320)
dba.deploySandboxInstance(3330)

shell.connect('root@localhost:3310')
var cluster = dba.createCluster('ociLabCluster')
cluster.addInstance('root@localhost:3320')
cluster.addInstance('root@localhost:3330')
cluster.status()
```

`topology`に3インスタンスが`ONLINE`として表示されれば成功です。

作成後は、各Sandboxを削除します。

```javascript
dba.deleteSandboxInstance(3310)
dba.deleteSandboxInstance(3320)
dba.deleteSandboxInstance(3330)
```

詳細なコマンドは[`sandbox/cluster.js`](../sandbox/cluster.js)にあります。
