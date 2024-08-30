const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const {body, validationResult,check} = require('express-validator')
const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');


require('./utils/db'); // konfigurasi koneksi
const Contact = require('./model/contact'); // model

const app = express();
const port = 3000;

//set up method override
app.use(methodOverride('_method'))

//set up view engine
app.set('view engine', 'ejs');// Using set ejs
app.use(expressLayouts); // third-party-middleware
app.use(express.static('public')); // built-in-middleware
app.use(express.urlencoded({extended: true})); // built-in-middleware untuk post data kirim

//konsigarasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie : {maxAge: 6000},
    secret:'secret',
    resave:true,
    saveUninitialized:true,
}));

app.use(flash());

//view home
app.get('/', (req, res) => {
    res.render('index', {
        content : 'Hasbi Radifan L', 
        title: 'Halaman Home',
        layout : 'layouts/main-layout',
    });
});

//view about
app.get('/about', (req, res) => {
    res.render('about', {
        layout : 'layouts/main-layout',
        title : 'Halaman About',
    });
});

//view contact alumni
app.get('/contact', async (req,res) => {

    const contacts = await Contact.find();

    res.render('contact', {
        title : 'Halaman Daftar Contact',
        layout: 'layouts/main-layout',
        contacts,
        msg:req.flash('msg')
    })
}); 

//menampilkan view Form add data
app.get('/contact/add', (req,res) => {
    res.render('add-contact', {
     title: 'Form Tambah Data Contact',
     layout: 'layouts/main-layout',
    });
 });

// //process add data contact
app.post('/contact', [
    body('nama').custom( async (value) => {
        const duplikat = await Contact.findOne({nama: value});
        if(duplikat) {
            throw new Error('Nama Contact sudah terdaftar!');
        }
        return true; // jika namanya beda, maka dibiarkan
    }),
    check('lulusan', 'Lulusan tidak valid!'),
    check('email', 'Email tidak valid!').isEmail(), // apabila emainya salah
    check('nohp','No HP tidak valid !').isMobilePhone('id-ID'),
    check('alamat','Alamat tidak valid!'),
], (req,res) => {
    //tangkap dulu errors nya
    const errors = validationResult(req);
    if(!errors.isEmpty()) {

        res.render('add-contact', {
            title: 'Form Tambah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
        });
    } else {
        Contact.insertMany(req.body, (error, result) => {
            req.flash('msg', 'Data contact berhasil ditambahkan!'); // maka menampilkan pesan alert
            res.redirect('/contact');
        });
    }
});

// procces hapus halaman contact
// app.get('/contact/delete/:nama', async (req,res) => {
//     const contact = await Contact.findOne({nama : req.params.nama}) //mencari data kontak ingin dihapus

//     //jika contact tidak ada
//     if(!contact) {
//         res.status(404);
//         res.send('<h1>404</h1>')
//     } else {
//         Contact.deleteOne({_id: contact.id}).then((result) => {
//             req.flash('msg', 'Data contact berhasil dihapus!'); // maka menampilkan pesan alert
//             res.redirect('/contact'); // kirim ke halaman contact
//         });
//     }
   
// }); 

//form process delete
app.delete('/contact', (req, res) => {
   Contact.deleteOne({nama : req.body.nama}).then((result) => {
    req.flash('msg', 'Data contact berhasil dihapus!');
    res.redirect('/contact'); 
   });
});

//view Update
// Halaman form ubah contact
app.get('/contact/edit/:nama', async (req,res) => {
   const contact = await Contact.findOne({nama : req.params.nama});

    res.render('edit-contact', {
     title: 'Form Ubah Data Contact',
     layout: 'layouts/main-layout',
     contact, 
    });
 });

 //process update data
 app.put('/contact', [
    body('nama').custom(async(value, {req}) => {
        const duplikat = await Contact.findOne({nama: value});  
        if(value !== req.body.oldNama && duplikat) {
            throw new Error('Nama Contact sudah terdaftar!');
        }
        return true; 
    }),
    check('lulusan', 'Lulusan tidak valid!'),
    check('email', 'Email tidak valid!').isEmail(), 
    check('nohp','No HP tidak valid !').isMobilePhone('id-ID'),
    check('alamat','Alamat tidak valid!'),
], (req,res) => {
    //tangkap dulu errors nya
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        // return res.status(400).json({errors: errors.array()});
        // jika error maka kembali ke halaman /contact
        res.render('edit-contact', {
            title: 'Form Ubah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            contact : req.body, // walaupun ada error, supaya tetap ada isi setiap coloumn (value)
        });
    } else {
        Contact.updateOne({_id: req.body._id}, 
            {
                $set: {
                nama: req.body.nama,
                lulusan: req.body.lulusan,
                email: req.body.email,
                nohp: req.body.nohp,
                alamat: req.body.alamat,
            },
        }
        ).then((result) =>{
            req.flash('msg', 'Data contact berhasil diubah!'); // maka menampilkan pesan alert
            res.redirect('/contact'); // kirim ke halaman contact
        }); 
    }         
}
);

//view Detail Contact
app.get('/contact/:nama', async (req,res) => {
    const contact = await Contact.findOne({ // mencari berdasarkan nama
        nama: req.params.nama
    })

    res.render('detail', {
        title : 'Halaman Detail Contact',
        layout : 'layouts/main-layout',
        contact,
    });
});





app.listen(port, () => {
    console.log(`Database App | listening at http://localhost:${port}`);
});