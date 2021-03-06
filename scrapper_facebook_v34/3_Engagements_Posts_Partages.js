/* Relever les Engagements des posts Partages d'une campagne
*/

import puppeteer from 'puppeteer'
import child_process from 'child_process'
import UpdateCookiesAmbassadeur from './src/UpdateCookiesAmbassadeur.js'
import getCookiesAmbassadeur from './src/getCookiesAmbassadeur.js'
import scrapperPostPartage from './src/scrapperPostPartage.js'
import getLoginAmbassadeur from './src/getLoginAmbassadeur.js'
import getIdAmbassadeur from './src/getIdAmbassadeur.js'
import getDernierReleveCampagne from './src/getDernierReleveCampagne.js'
import InsertReleveCampagne from './src/InsertReleveCampagne.js'
import dbconnect from './src/dbconnection.js'
import login from './src/login.js'

(async function () {
    const prenom = process.argv[2]
    const nom = process.argv[3]
    const id_campagne = parseInt(process.argv[4])

    var db = dbconnect()
    var idPost_probleme = 1
    var id_releve_campagne = 1
    var id_ambassadeur = 1
    var loginPassword = ''
    var page = null
    var rapport = ''
    process.stdin.resume();
    
    process.stdin.on('data', async ( chunk) => {             
          const text = chunk.toString();                  
          if (text.indexOf('quitter') != -1){
            var cookies = await page.cookies()
            await UpdateCookiesAmbassadeur(id_ambassadeur,JSON.stringify(cookies, null, 2))
            await page.waitForTimeout(3000)
            console.log(rapport)
            console.log('\nAu revoir\n')
            process.exit(1)
          }
    });
    
    process.on('unhandledRejection', async (reason, promise) => {
            var cookies = await page.cookies()
            if (JSON.stringify(cookies, null, 2).localeCompare('[]') != 0){
                await UpdateCookiesAmbassadeur(id_ambassadeur,JSON.stringify(cookies, null, 2))
                await page.waitForTimeout(3000)
            }
            if (promise.indexOf('Error: Protocol error (Runtime.callFunctionOn): Execution context was destroyed.') != -1){
                const err = await UpdatePostStatutScrappe(db,idPost_probleme,'scrapp??')
                await scrapperPostPartage(page,prenom,loginPassword,id_campagne,id_releve_campagne,idPost_probleme,rapport)
	            var cookies = await page.cookies();
                        await UpdateCookiesAmbassadeur(id_ambassadeur,JSON.stringify(cookies, null, 2))
	                    const message = 'Script Fini'
	                    await page.evaluate(async message => {
                
                                await window.alert(message)
                           
                        }, message)
                        const spawn = child_process.spawn
                        if (OS.indexOf('Linux') != -1){
                            const fini_spawn = spawn('notify-send', ['Script Fini']);
                        }else{
                            const exec = child_process.exec
                            const fini_exec = exec('start cmd /C "echo Script Fini && pause"')
                        }
            }else{
                console.log('Unhandled Rejection at:', promise, 'reason:', reason);
                const message = 'Il y a une crache. Relancer le script'
	                    await page.evaluate(async message => {
            
                            await window.alert(message)
                       
                        }, message)
                        const spawn = child_process.spawn
                        if (OS.indexOf('Linux') != -1){
                            const fini_spawn = spawn('notify-send', ['Script Crach??']);
                        }else{
                            const exec = child_process.exec
                            const fini_exec = exec('start cmd /C "echo Script Crach?? && pause"')
                        }
                console.log(rapport)
            }
            console.log('\nAu revoir\n')
            process.exit(1)
        
    });
    
    if (process.argv.length < 5) {
            console.log('Nombre d\'arguments est trop petit !\n')
            await AfficherMenu()

    }else {
                if (nom && (await getIdAmbassadeur(prenom,nom)) && prenom && (await getLoginAmbassadeur(prenom,nom)) && id_campagne != null) {
                    
                    var dernier_releve = await getDernierReleveCampagne(db,id_campagne)
                    if (!dernier_releve || dernier_releve.statut_releve.localeCompare('termin??') == 0){
                        var err = await InsertReleveCampagne(db,id_campagne)
                        dernier_releve = await getDernierReleveCampagne(db,id_campagne)
                    }
                    var id_releve_campagne = dernier_releve.id_releve_campagne
                    
                    id_ambassadeur = await getIdAmbassadeur(prenom,nom)
                    const loginPassword = await getLoginAmbassadeur(prenom,nom)
                    
                    console.log('Debut Script')
                    const browser = await puppeteer.launch({
                        headless: false,
		                args: ["--no-sandbox","--disable-notifications"]
                    });

	                page = await browser.newPage()
                    
                    const cookiestring = await getCookiesAmbassadeur(id_ambassadeur)
                        if (cookiestring){
                            var cookies = JSON.parse(cookiestring)
                            await page.setCookie(...cookies);
                        }
                        
                        var OS = await page.evaluate(async message => {
                                var OS = "OS Inconnu"; 
                                if (navigator.appVersion.indexOf("Win")!=-1) OS = "Windows"; 
                                if (navigator.appVersion.indexOf("Mac")!=-1) OS = "MacOS"; 
                                if (navigator.appVersion.indexOf("X11")!=-1) OS = "Unix"; 
                                if (navigator.appVersion.indexOf("Linux")!=-1) OS = "Linux";
                                return OS
                           
                        }, '')
                        
	                await scrapperPostPartage(page,prenom,loginPassword,id_campagne,id_releve_campagne,idPost_probleme,rapport)
	                    
                        var cookies = await page.cookies();
                        await UpdateCookiesAmbassadeur(id_ambassadeur,JSON.stringify(cookies, null, 2))
	                    const message = 'Script Fini'
	                    await page.evaluate(async message => {
                
                                await window.alert(message)
                           
                        }, message)
                        const spawn = child_process.spawn
                        if (OS.indexOf('Linux') != -1){
                            const fini_spawn = spawn('notify-send', ['Script Fini']);
                        }else{
                            const exec = child_process.exec
                            const fini_exec = exec('start cmd /C "echo Script Fini && pause"')
                        }
                }else{
                    console.log('Arguments non valides !\n')
                    await AfficherMenu()
                }
    }
    console.log('fini')
    process.exit(1)
})();

function AfficherMenu(){

            console.log('How To Use :\n')
            console.log('node scrappePostParatge.js Prenom nom id_campagne\n')
            console.log('Prenom : prenom de l\'ambassadeur de scrappe \nnom : nom de l\'ambassadeur de scrappe \nid_campagne : id de la campagne\n')
}
