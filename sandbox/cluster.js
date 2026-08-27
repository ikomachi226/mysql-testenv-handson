// mysqlsh --file cluster.js --js
dba.deploySandboxInstance(3310)
dba.deploySandboxInstance(3320)
dba.deploySandboxInstance(3330)

shell.connect('root@localhost:3310')
var cluster = dba.createCluster('ociLabCluster')
cluster.addInstance('root@localhost:3320')
cluster.addInstance('root@localhost:3330')
print(JSON.stringify(cluster.status(), null, 2))
