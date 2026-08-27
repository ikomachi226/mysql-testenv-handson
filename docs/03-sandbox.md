# SandboxでInnoDB Clusterを試す

Sandboxはコンテナではありません。

MySQL Shellが同一ホストにローカルmysqldを作成し、AdminAPIの検証用設定を準備します。

MySQL Yum RepositoryのOracle Linux 9向けリリースRPMを取得し、MySQL ServerとMySQL Shellを導入します。

```bash
cd /tmp
curl -LO https://repo.mysql.com/mysql97-community-release-el9.rpm
// ダウンロードした9.7rpmを指定する
sudo dnf install -y ./mysql97-community-release-el9.rpm
sudo dnf install -y mysql-community-server mysql-shell
which mysqld mysqlsh
mysqlsh --version
```

9.7系列が有効であることを確認してから、3つのSandboxを作成します。

```javascript
// MySQL ShellをJavaScriptモードで起動
mysqlsh --js
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

## プライマリの停止と自動フェイルオーバーを確認する

Sandboxの3310を強制停止します。

これは障害を模擬する操作です。***本番環境のMySQL Serverに対して実行しないでください***

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

テスト後は、各Sandboxを削除します。

```javascript
dba.deleteSandboxInstance(3310)
dba.deleteSandboxInstance(3320)
dba.deleteSandboxInstance(3330)
```
MySQL Shellの終了コマンドは\quitです。

詳細なコマンドは[`sandbox/cluster.js`](../sandbox/cluster.js)にあります。

実行画面例
<img width="669" height="374" alt="image" src="https://github.com/user-attachments/assets/6ba4a392-f63e-454f-ab3c-6a7fab5bed52" />

<img width="1217" height="805" alt="image" src="https://github.com/user-attachments/assets/f0f20b2a-3e0b-4930-8c67-e1cd3238c6f1" />

<img width="598" height="636" alt="image" src="https://github.com/user-attachments/assets/4ee75aa0-037b-4bf8-9206-2ae2521ee255" />

<img width="1218" height="355" alt="image" src="https://github.com/user-attachments/assets/a85f2e91-fb13-47ca-8ef8-c749d59993d4" />

<img width="729" height="191" alt="image" src="https://github.com/user-attachments/assets/6568e30a-ce82-42a1-bd84-6a28019d999b" />

<img width="616" height="140" alt="image" src="https://github.com/user-attachments/assets/29e74341-4185-44dd-a557-00e0961a63f8" />

<img width="401" height="256" alt="image" src="https://github.com/user-attachments/assets/fefd1961-dc9d-405e-9f62-eb1276e74e56" />

