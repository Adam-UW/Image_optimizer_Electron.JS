const path = require('path')
const os = require('os')
const {app, BrowserWindow, Menu, globalShortcut, ipcMain, shell } = require('electron')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const slash = require('slash')
// Set env
process.env.NODE_ENV = 'development'
//*{To check if the app is on Dev or on Production} 
const isDev = process.env.NODE_ENV !== 'production' ? true : false
// console.log(process.platform)
const isMac= process.platform === 'darwin' ? true : false
const isWin= process.platform === 'win32' ? true : false

let mainWindow
let aboutWindow

function createMainWindow(){
     mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: isDev ?800 : 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white',
        webPreferences:{
            nodeIntegration: true
        }
    })

    /** {To show the dev menu on Devlopment stage} */
    if(isDev){
        mainWindow.webContents.openDevTools()
    }

    // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.loadFile('./app/index.html')
}

//About 
function createAboutWindow(){
    aboutWindow = new BrowserWindow({
       title: 'About ImageShrink',
       width: 300,
       height: 300,
       icon: `${__dirname}/assets/icons/Icon_256x256.png`,
       resizable: false,
       backgroundColor: 'white'
   })

   // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
   aboutWindow.loadFile('./app/about.html')
}



app.on('ready', ()=>{
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    // globalShortcut.register('CmdOrCtrl+R', ()=> mainWindow.reload())
    // globalShortcut.register( isMac ? 'CmdOrCtrl+Alt+I' : 'Ctrl+Shift+I', ()=> mainWindow.toggleDevTools())

    mainWindow.on('closed', ()=> mainWindow = null) // For garbage collection
})

const menu = [
    ...(isMac ? [{
        label : app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : []), // For mac to show the File on top
    {
        // label: 'File',
        // submenu:[
        //     {
        //         label: 'Quit',
        //         accelerator: isMac ? 'Commmand+W' : 'Ctrl+W',
        //         // accelerator: 'CmdOrCtrl+W', {OPTIONAL, Cross platform}
        //         click: () => app.quit()
        //     }
        // ]
        role: 'fileMenu', // @NOTE this replaces the code above!! how cool is that
    },
    ...(isDev ? [
        {
            label: 'Developer',
            submenu:[
                {role: 'reload'},
                {role: 'forcereload'},
                {type: 'separator'},
                {role: 'toggledevtools'},
            ]
        }
    ] : []),
    ...(! isMac ? [ // Order is messed up So far
        {
            label: 'Help',
            submenu:  [
                {
                    label: 'About',
                    click: createAboutWindow

                }
            ]
        }
    ] : []),
]

ipcMain.on('image:minimize', (e, options)=>{
    options.dest = path.join(os.homedir(), 'imageshrink')
    shrinkImage(options)
    console.log(options)
})


// Main shrinking is done here 
async function shrinkImage ({imgPath, quality, dest}){
    try {
        const pngQuality = quality / 100
        const files= await imagemin([slash(imgPath)], {
            destination: dest,
            plugins: [
                imageminMozjpeg({quality}),
                imageminPngquant({
                    quality: [pngQuality, pngQuality]
                })
            ]
        })

        console.log(files)
        shell.openPath(dest)
    } catch (error) {
        console.log(error)
        
    }

}



// For mac user to show the file jMenu
if(isMac){
    menu.unshift({ role: 'appMenu'})
}

app.on('window-all-closed', ()=>{
    if(!isMac){
        app.quit()
    }
})

app.on('activate', ()=>{
    if(BrowserWindow.getAllWindows().length === 0){
        createMainWindow()
    }
})

app.allowRendererProcessReuse = true