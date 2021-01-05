const colorThief = new ColorThief();
const img = document.querySelector('img');
var arr = [];
// Make sure image is finished loading
if (img.complete) {
  arr =colorThief.getPalette(img, 3)
  document.body.style.background = `linear-gradient(to bottom, rgba(${arr[0].toString()}),rgba(${arr[1].toString()}))`;

} else {
  img.addEventListener('load', function() {
    arr =colorThief.getPalette(img, 3)
    document.body.style.background = `linear-gradient(to bottom, rgba(${arr[0].toString()}),rgba(${arr[1].toString()}))`;

  });
}




















//----------------- SERVICE WORKER STUFF -----------------------
window.addEventListener('load',main)
function main(){
    vaildateCacheIfOnline()
    .then(_=>{
    })
}

// if settings in the config.json have changed, then update the cache
function vaildateCacheIfOnline(){
    return new Promise((resolve,reject)=>{
        fetch(`config.json?cacheBust=${new Date().getTime()}`)
        .then(response => { return response.json() })
        .then(config => {

            let installedVersion = Settings.getVersion()
            if ( installedVersion== 0) {
                Settings.setVersion(config.version)
                // document.querySelector('#version').innerHTML= `version ${config.version}`;
                return resolve();
            }
            else if (installedVersion != config.version) {
                console.log('Cache Version mismatch')
                fetch(`config.json?clean-cache=true&cacheBust=${new Date().getTime()}`).then(_ => {
                    //actually cleans the cache
                    Settings.setVersion(config.version);
                    // localStorage.removeItem('dataCardSet');
                    console.log("Old dataset removed. Reloading for new version.")
                    window.location.reload();
                    return resolve();  // unnecessary
                });

            }else{
                // already updated
                console.log('Cache Updated')
                // document.querySelector('#version').innerHTML= `version ${installedVersion}`;
                return resolve();
            }
        }).catch(err=>{
            console.log(err);
            return resolve();
            //handle offline here
        })
    })
}
//----------------- END SERVICE WORKER STUFF -----------------------
