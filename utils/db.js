// panggil monggose utk koneksi kedalam database mongodb
const mongoose = require('mongoose');
const { type } = require('os');
const { stringify } = require('querystring');
mongoose.connect('mongodb://127.0.0.1:27017/wpu',{
    useNewUrlParser : true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});




// // menambah 1 data
// const matkul1 = new Matakuliah({
//     matkul : 'Programmer',
// });

// matkul1.save().then((matkul) => console.log(matkul));