# SandboxでInnoDB Clusterを試す

Sandboxはコンテナではありません。

MySQL Shellが同一ホストにローカルmysqldを作成し、AdminAPIの検証用設定を準備します。

MySQL Yum RepositoryのOracle Linux 9向けリリースRPMを取得し、MySQL ServerとMySQL Shellを導入します。

```bash
cd /tmp
curl -LO https://repo.mysql.com/mysql97-community-release-el9.rpm
sudo dnf install -y ./mysql97-community-release-el9.rpm
sudo dnf install -y mysql-community-server mysql-shell
which mysqld mysqlsh
mysqlsh --version
```

## Sandboxで使うMySQL Serverのバージョンを選ぶ

SandboxのMySQL Serverバージョンは、MySQL Shell自体のバージョンではなく、Sandbox作成に使う`mysqld`バイナリで決まります。

MySQL Shell 9.4以降では、`mysqldPath`オプションに`mysqld`本体へのパス、またはMySQLのインストールルートを指定できます。

試したいMySQL Serverバージョンのバイナリは、あらかじめホストにインストールしておきます。

SandboxがMySQL Serverをダウンロードするわけではありません。

まず、使用する`mysqld`のパスを確認します。

```bash
which mysqld
mysqld --version
```

このハンズオンで導入したMySQL 9.7を使う例は次のとおりです。

```javascript
// mysqlsh --js
dba.deploySandboxInstance(
  3310,
  { mysqldPath: '/usr/sbin/mysqld' }
)
```

`/opt/mysql-8.4/bin/mysqld`や`/opt/mysql-9.7/bin/mysqld`のように複数のServerバイナリを用意していれば、`mysqldPath`を切り替えることでSandboxのServerバージョンを選べます。

MySQL Shell 9.7はMySQL 8.0以降のGA版との利用が推奨されています。

ここでは、確認した`mysqld`のパスを使って3つのSandboxを作成します。

```javascript
// mysqlsh --js
var sandboxOptions = { mysqldPath: '/usr/sbin/mysqld' }

dba.deploySandboxInstance(3310, sandboxOptions)
dba.deploySandboxInstance(3320, sandboxOptions)
dba.deploySandboxInstance(3330, sandboxOptions)

shell.connect('root@localhost:3310')
var cluster = dba.createCluster('ociLabCluster')
cluster.addInstance('root@localhost:3320')
cluster.addInstance('root@localhost:3330')
cluster.status()
```

`topology`に3インスタンスが`ONLINE`として表示されれば成功です。

## 更新がセカンダリへ反映されることを確認する

この時点では、3310がプライマリです。

3310へ接続したMySQL Shellで、テスト用の表と1行を作成します。

```javascript
session.runSql('CREATE DATABASE IF NOT EXISTS labdb')
session.runSql('CREATE TABLE IF NOT EXISTS labdb.cluster_note (id INT PRIMARY KEY, note VARCHAR(100))')
session.runSql("INSERT INTO labdb.cluster_note VALUES (1, 'written-on-primary') ON DUPLICATE KEY UPDATE note = VALUES(note)")
```

次にセカンダリの3320へ接続して、同じ行を読めることを確認します。

```javascript
shell.connect('root@localhost:3320')
session.runSql('SELECT * FROM labdb.cluster_note')
```

3310で書き込んだ`written-on-primary`が表示されれば、Group Replicationによる更新反映を確認できます。

## プライマリの停止と自動フェイルオーバーを確認する

Sandboxの3310を強制停止します。

これは障害を模擬する操作です。

本番環境のMySQL Serverに対して実行しないでください。

```javascript
dba.killSandboxInstance(3310)
```

生存している3320へ接続して、Clusterの状態を確認します。

```javascript
shell.connect('root@localhost:3320')
var cluster = dba.getCluster()
var status = cluster.status()
print(JSON.stringify(status, null, 2))
var newPrimary = status.defaultReplicaSet.primary
print('New primary: ' + newPrimary)
```

`defaultReplicaSet.primary`が3310以外になり、3310が`MISSING`と表示されれば自動フェイルオーバーは成功です。

新しいプライマリへ接続して、書き込みを続けられることを確認します。

```javascript
shell.connect('root@' + newPrimary)
session.runSql("INSERT INTO labdb.cluster_note VALUES (2, 'written-after-failover') ON DUPLICATE KEY UPDATE note = VALUES(note)")
session.runSql('SELECT * FROM labdb.cluster_note')
```

最後に元の3310を起動し、Clusterへ再参加したことを確認します。

```javascript
dba.startSandboxInstance(3310)
cluster.status()
```

Sandboxを削除する前に、各インスタンスを停止します。

`dba.deleteSandboxInstance()`は、実行中のSandboxを削除しません。

```javascript
dba.stopSandboxInstance(3310)
dba.stopSandboxInstance(3320)
dba.stopSandboxInstance(3330)

dba.deleteSandboxInstance(3310)
dba.deleteSandboxInstance(3320)
dba.deleteSandboxInstance(3330)
```

詳細なコマンドは[`sandbox/cluster.js`](../sandbox/cluster.js)にあります。

## 参考資料

- [Deploying Sandbox Instances](https://dev.mysql.com/doc/mysql-shell/9.7/en/deploy-sandbox-instances.html)
- [Changes in MySQL Shell 9.4.0](https://dev.mysql.com/doc/relnotes/mysql-shell/26.7/en/news-9-4-0.html)
