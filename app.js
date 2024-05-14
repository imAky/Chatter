require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
const PORT = process.env.PORT;








const app = express()
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI);







const chatterSchema = new mongoose.Schema({
    title: String,
    time: String,
    content: String,
    comments: [String]
});


const Chat = mongoose.model("Chat", chatterSchema);








const createTime = function(){
  
    const event = new Date();
    const createTime = event.toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      })
    return createTime;
}


app.get('/', async function(req, res){
    try{
        const posts = await Chat.find().sort({_id: -1});
        res.render('home', {posts: posts});
    } catch (err){
        console.log(err);
    }
} )

app.get('/about', (req, res) => {
    res.render('about');
})


app.get('/contact', (req, res) => {
    res.render('contact');
})



app.get('/post', (req, res) => {
    res.render('post');
})

app.post('/post', (req, res) => {

    const chatsdata = new Chat({
        title: req.body.catList,
        time: createTime(),
        content: req.body.content,
        comments: []
        
        
    });

    chatsdata.save();
    
    res.redirect('/')
})


app.get('/detail/:postId', (req, res) =>{
    
    const onepostId = req.params.postId;
    
    Chat.findById(onepostId,function(err, onepostCont){
        if(err){
            console.log(err);
        }else{
            const Docs = onepostCont;
            res.render('detail',{doc: Docs});
        }
    })
    
    
    
})



app.post('/detail/:postId', async function (req, res){
    
    const updateId = req.params.postId;
    const commentItem = req.body.commentItem;
    await Chat.updateOne(
        {_id: updateId},
        { $push: { comments: commentItem}}
    );

    
    res.redirect(`/detail/${updateId}`);
    
})


app.get('/detail/:postId/delete/:pass', async function(req, res){
    const deletePostId = req.params.postId;
    const pass = req.params.pass;
    if(pass==process.env.PASSWORD){
        await Chat.deleteOne({
            "_id" : deletePostId
        });
        res.redirect('/')
    }else{
        res.send('Enter valid password for Delete post');
    }
   
})

app.listen(PORT, () => {
    console.log('Server is running on port 3000')
})
