const functions = require('firebase-functions');
const jimp = require('jimp');
const lsb = require('lsb');
const path = require('path');
const fs = require('mz/fs');

//decode l'image et retourne un tableau avec son index et son message caché
async function decode(inputImage) {
  const image = await jimp.read(inputImage);
  const json = lsb.decode(image.bitmap.data, rgb);
  return JSON.parse(json);
}

function rgb(n) {
  return n + Math.floor(n/3);
}

// retourne la suite des images avec leur url respective
async function getImages()
{
    const files = await fs.readdir("./images");
    return files;
}

exports.index = functions.https.onRequest(async (request, response) => {
  const images = await getImages();
  var messageConcatenation = ``;//variable contenant tous les messages et qui sera affiché dans le footer
  var tableauTriImages = [];
  var htmlh1 = ``;

  for(var i= 0; i < images.length; i++)
  {   
    tableauTriImages=tableauTriImages.concat(await decode('./images/'+images[i])); //concaténation qui sert à mettre toutes les images et leurs informations dans un même document JSON
    tableauTriImages[i]['url'] = images[i]; //ajouter au tableau l'url à côté du message et de l'index de l'image
  }

   tableauTriImages.sort((a,b) => a.index - b.index);//trier le document JSON en fonction des index (ordre croissant)

   tableauTriImages.forEach(function(images) {
    messageConcatenation = messageConcatenation.concat(images.message);//concaténation de tous les messages des images
    htmlh1 = htmlh1 + //démarche consistant à créer toutes les balises h1 pour ensuite les insérer dans le body
            `<h1>Nom: `+images.url+` - Index:`+images.index+`</h1>
            <img src="/imga?name=`+images.url+`"/>` 
  });

  var html =`<html>
              <body>`+htmlh1+`</body>
              <footer>`+messageConcatenation+`</footer>
              </html>`     
     response.send(html);
});

exports.imga = functions
  .https
  .onRequest(async(request, response) => {
    response.sendFile(path.resolve('./images/'+request.query.name+''));
  });