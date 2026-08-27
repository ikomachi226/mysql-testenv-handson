// mysqlsh --file cluster.js --js
//
// このファイルは新しいSandbox用です。
// 実行後、表示される順番で関数を呼び出して確認します。

var primaryPort = 3310
var secondaryPorts = [3320, 3330]
var clusterName = 'ociLabCluster'

function connectTo(port) {
  shell.connect('root@localhost:' + port)
}

function printStatus() {
  var cluster = dba.getCluster()
  var status = cluster.status()
  print(JSON.stringify(status, null, 2))
  return status
}

function createLabCluster() {
  dba.deploySandboxInstance(primaryPort)
  dba.deploySandboxInstance(secondaryPorts[0])
  dba.deploySandboxInstance(secondaryPorts[1])

  connectTo(primaryPort)
  var cluster = dba.createCluster(clusterName)
  cluster.addInstance('root@localhost:' + secondaryPorts[0])
  cluster.addInstance('root@localhost:' + secondaryPorts[1])
  printStatus()
}

function verifyReplication() {
  // 3310は、createLabCluster()直後のプライマリです。
  connectTo(primaryPort)
  session.runSql('CREATE DATABASE IF NOT EXISTS labdb')
  session.runSql('CREATE TABLE IF NOT EXISTS labdb.cluster_note (id INT PRIMARY KEY, note VARCHAR(100))')
  session.runSql("INSERT INTO labdb.cluster_note VALUES (1, 'written-on-primary') ON DUPLICATE KEY UPDATE note = VALUES(note)")

  secondaryPorts.forEach(function (port) {
    connectTo(port)
    print('Read from secondary ' + port + ':')
    print(JSON.stringify(session.runSql('SELECT * FROM labdb.cluster_note').fetchAll(), null, 2))
  })
}

function simulateFailover() {
  // Sandboxだけに使う障害シミュレーションです。
  // 実行後、Group Replicationによる選出が終わるまで数秒待ちます。
  dba.killSandboxInstance(primaryPort)
  print('3310 stopped. Wait a few seconds, then run: verifyFailover()')
}

function verifyFailover() {
  // 生存しているメンバーから状態を取得します。
  connectTo(secondaryPorts[0])
  var status = printStatus()
  var newPrimary = status.defaultReplicaSet.primary
  print('New primary: ' + newPrimary)

  if (newPrimary.indexOf(':' + primaryPort) !== -1) {
    throw new Error('Failover is not complete yet. Wait a few seconds and run verifyFailover() again.')
  }

  shell.connect('root@' + newPrimary)
  session.runSql("INSERT INTO labdb.cluster_note VALUES (2, 'written-after-failover') ON DUPLICATE KEY UPDATE note = VALUES(note)")
  print(JSON.stringify(session.runSql('SELECT * FROM labdb.cluster_note').fetchAll(), null, 2))
}

function recoverOriginalPrimary() {
  // 停止した3310を起動し、Clusterへの再参加を確認します。
  connectTo(secondaryPorts[0])
  dba.startSandboxInstance(primaryPort)
  printStatus()
}

function deleteLabSandboxes() {
  // 削除前に停止が必要です。
  var allPorts = [primaryPort].concat(secondaryPorts)

  allPorts.forEach(function (port) {
    dba.stopSandboxInstance(port)
  })

  allPorts.forEach(function (port) {
    dba.deleteSandboxInstance(port)
  })
}

createLabCluster()
verifyReplication()

print('Next steps:')
print('  1. simulateFailover()')
print('  2. Wait a few seconds')
print('  3. verifyFailover()')
print('  4. recoverOriginalPrimary()')
print('  5. deleteLabSandboxes()  // Cleanup')
