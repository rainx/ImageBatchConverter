// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// https://jaketrent.com/post/select-directory-in-electron/
const electron = require('electron')
const remote = electron.remote
const mainProcess = remote.require('./main')
const ipcRenderer = require('electron').ipcRenderer;
let watching = false

const $ = require("jquery")


document.getElementById('sourcePathButton').addEventListener('click', _ => {
    document.getElementById('sourcePathRealButton').click()
})

document.getElementById("sourcePathRealButton").addEventListener("change", (e) => {
    const fileName = e.target.files[0].path
    document.getElementById("sourcePath").value = fileName
})

document.getElementById('dstPathButton').addEventListener('click', _ => {
    document.getElementById('dstPathRealButton').click()
})

document.getElementById("dstPathRealButton").addEventListener("change", (e) => {
    const fileName = e.target.files[0].path
    document.getElementById("dstPath").value = fileName
})

function getSourcePath() {
    return document.getElementById("sourcePath").value.trim()
}

$("#isEqualToSrc").change((e) => {
    const isCheck = $(e.target).is(':checked')
    if (isCheck) {
        $("#dstPath").val("")
        $("#dstPath").attr("readonly", true)
        $("#dstPathButton").hide()
    } else {
        $("#dstPath").attr("readonly", false)
        $("#dstPathButton").show()
    }
})

function getTargetPath() {
    const isCheck = $("#isEqualToSrc").is(':checked')
    if (isCheck) {
        return document.getElementById("sourcePath").value.trim()
    } else {
        return $("#dstPath").val().trim()
    }
}

function getTargetExt() {
    const val = document.getElementById("outputFileType").value
    if (val == '1') {
        return 'bmp'
    } else if (val == '2') {
        return 'png'
    } else {
        return 'bmp'
    }
}

function getFilter() {
    return document.getElementById("sourceFilter").value.trim()
}

document.getElementById("convertAll").addEventListener("click", () => {
    const isCheck = $("#isEqualToSrc").is(':checked')

    if (getSourcePath() == '') {
        alert('来源目录不能为空')
        return
    }

    if (!isCheck && getTargetPath() == '') {
        alert('目标目录不能为空')
        return
    }

    mainProcess.convertAll(
        getSourcePath(),
        getTargetPath(),
        getFilter(),
        getTargetExt()
    )
})



document.getElementById("watchAndConvert").addEventListener("click", (e) => {
    if (!watching) {
        const isCheck = $("#isEqualToSrc").is(':checked')

        if (getSourcePath() == '') {
            alert('来源目录不能为空')
            return
        }

        if (!isCheck && getTargetPath() == '') {
            alert('目标目录不能为空')
            return
        }

        e.target.innerText = 'Stop Watching'
        insertConsoleLog('开始监听....')
        mainProcess.startWatching(
            getSourcePath(),
            getTargetPath(),
            getFilter(),
            getTargetExt()
        )
        watching = true
    } else {
        e.target.innerText = 'Watch And Convert'
        mainProcess.stopWatching()
        insertConsoleLog('结束监听....')
        watching = false
    }

})


function insertConsoleLog(message) {
    const d = new Date().toISOString()
    document.getElementById("logConsole").value = d + " > " + message + "\n" + document.getElementById("logConsole").value;
}

ipcRenderer.on('console', (event, message) => {
    insertConsoleLog(message)
})