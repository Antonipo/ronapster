const { Router } = require('express');
const router = Router();
const Audio = require('../models/audio');
const cloudinary = require('cloudinary');
const fs = require('fs-extra');

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get('/',async(req,res)=>{
    const audio =await Audio.find().lean();
    res.render('audio',{audio})
});

router.get('/audios/add', async(req,res) =>{
    const audio =await Audio.find().lean();
    res.render('audio_form.hbs', {audio})
});

router.post('/audios/add', async (req, res) => {
    try {
        const { title, description } = req.body;
        // Subir una imagen
        const result =await cloudinary.v2.uploader.upload(req.file.path, {
            folder:'audios',
            resource_type: "video", // Cloudinary trata los archivos de audio como archivos de video
        })
        console.log(result)
        console.log('########################')
        cloudinary.v2.api.resource_by_asset_id(result.asset_id).then(console.log)

        // Ahora puedes utilizar la información de 'result' para construir tu objeto Audio
        // Por ejemplo, result.secure_url contiene la URL del archivo en Cloudinary
        const newAudio = new Audio({
            title: title,
            description: description,
            audioURL: result.secure_url,
            public_id: result.public_id,
        })

        await newAudio.save();
        await fs.unlink(req.file.path);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al subir el archivo");
    }
});

router.get('/audios/delete/:audio_id', async(req,res)=>{
    const {audio_id} = req.params;
    const audio =await Audio.findByIdAndDelete(audio_id);
    console.log(audio)

    try {
        const result = await cloudinary.v2.api.delete_resources([audio.public_id],{
            type:'upload',
            resource_type:'video'
        });
        console.log(result)
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar el audio de cloudinary");
    }

    res.redirect('/audios/add');
});

module.exports = router;
