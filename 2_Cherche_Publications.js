/* chercher par les posts partagés d'une campagne (id_campagne) 
    dans les groupes d'un segment (id_segment) qui ont des mots clés spécifiques dans son contenu
   et stocker les id Post scrappés dans la base de données
*/

import puppeteer from 'puppeteer'
import child_process from 'child_process'
import UpdateCookiesAmbassadeur from './src/UpdateCookiesAmbassadeur.js'
import getCookiesAmbassadeur from './src/getCookiesAmbassadeur.js'
import chercherCampagne from './src/chercherCampagne.js'
import getIdAmbassadeur from './src/getIdAmbassadeur.js'
import getLoginAmbassadeur from './src/getLoginAmbassadeur.js'
import login from './src/login.js'


 (async function () {
    const prenom1 = process.argv[2]
    const nom1 = process.argv[3]
    const nom2 = process.argv[4]
    const id_campagne = parseInt(process.argv[5])

    var id_ambassadeur = 1
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
            console.log('Unhandled Rejection at:', promise, 'reason:', reason);
            const message = 'Il y a une crache. Relancer le script'
	                await page.evaluate(async message => {
        
                        await window.alert(message)
                   
                    }, message)
                    const spawn = child_process.spawn
                    if (OS.indexOf('Linux') != -1){
                        const fini_spawn = spawn('notify-send', ['Script Craché']);
                    }else{
                        const exec = child_process.exec
                        const fini_exec = exec('start cmd /C "echo Script Craché && pause"')
                    }
            console.log(rapport)
            console.log('\nAu revoir\n')
            process.exit(1)
        
    });
    
    if (process.argv.length < 6) {

            console.log('Nombre d\'arguments est trop petit !\n')
            await AfficherMenu()

    }else {
        
        if (prenom1 && (await getLoginAmbassadeur(prenom1)) && nom1 && (await getIdAmbassadeur(nom1)) && nom2 && (await getIdAmbassadeur(nom2)) && id_campagne ){
                id_ambassadeur = await getIdAmbassadeur(nom1,null)
                const id_ambassadeur2 = await getIdAmbassadeur(nom2,null)
                const loginPassword = await getLoginAmbassadeur(prenom1)

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
                
	            await login(page,prenom1,loginPassword)
                console.log('\nfacebook')
                
                const Ids = await chercherCampagne(page,id_ambassadeur2,id_campagne,rapport)
	            
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
                await page.waitForTimeout(30000)
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
            console.log('node chercheCampagne.js Prenom1 nom1 nom2 id_campagne \n')
            console.log('Prenom1 : prenom de l\'ambassadeur de recherche \nnom1 : nom de l\'ambassadeur de recherche \nnom2 : nom de l\'ambassadeur de Partage \nid_campagne : id de la campagne \n')
}
