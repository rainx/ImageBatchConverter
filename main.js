const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require("fs")
const Jimp = require("jimp")
const minimatch = require("minimatch")


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let fsWatcher = null

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

function checkParams(sourcePath, targetPath, filter, targetFormat) {
    const sourcePathStats = fs.statSync(sourcePath)
    const targetPathStats = fs.statSync(targetPath)

    if(!sourcePathStats.isDirectory()) {
        mainWindow.webContents.send("console", "source dir is not exists!")
        return false
    }

    if(!targetPathStats.isDirectory()) {
        mainWindow.webContents.send("console", "target dir is not exists!")
        return false
    }

    return true
}

async function convertAll(sourcePath, targetPath, filter, targetFormat) {

    if (!checkParams(sourcePath, targetPath, filter, targetFormat)) {
        return 0
    }

    const files = fs.readdirSync(sourcePath)
    const fileredFiles = files.filter((f) => {
        return minimatch(f, filter)
    })

    for (const f of fileredFiles) {
        const outputFileFullPath = targetPath + path.sep + path.parse(f).name + "." + targetFormat
        const image = await Jimp.read(sourcePath + path.sep + f)
        image.write(outputFileFullPath, ()=> {
            mainWindow.webContents.send("console", "File " +outputFileFullPath + " Saved!")
        })
    }
}


function startWatching(sourcePath, targetPath, filter, targetFormat) {
    if (!checkParams(sourcePath, targetPath, filter, targetFormat)) {
        return 0
    }

    if (fsWatcher) {
        fsWatcher.close()
        fsWatcher = null
    }

    fsWatcher = fs.watch(sourcePath, async (eventType, filename) => {
        const f = filename
        if (minimatch(f, filter)) {
            const outputFileFullPath = targetPath + path.sep + path.parse(f).name + "." + targetFormat
            const image = await Jimp.read(sourcePath + path.sep + f)
            image.write(outputFileFullPath, ()=> {
                mainWindow.webContents.send("console", "File " +outputFileFullPath + " Saved!")
            })
        }
    })

}

function stopWatching() {
    if (fsWatcher) {
        fsWatcher.close()
        fsWatcher = null
    }

}



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
exports.convertAll = convertAll
exports.startWatching = startWatching
exports.stopWatching = stopWatching
