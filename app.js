
const express = require('express');
const path = require('path');
const app = express();
const methodOverride = require('method-override'); //method-override allows us to use PUT and DELETE requests.
var bodyParser = require('body-parser');
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
// const chirag = require('./index');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(bodyParser.json());

//write all the routes here

function CSV(csv) {
  var array = csv.toString().split("\n");
  let output = [];
  let c = 0;
  for (let i = 1; i < array.length-1; i++) {
      let y = array[i].split("");
      c=0;
      for(let j=0;j<y.length;j++){
          if(y[j]=='{'){
              c=1;
          }if(c==1 && y[j]==','){
              y[j]=';';
          }
      }
      array[i]=y.join("");
  }
  const titles = array[0].split(",");
  for (let i = 1; i < array.length; i++) {
      array[i] = array[i].split(",");
      const obj = {};
      for (let j = 0; j < array[i].length; j++) {
          array[i][j] = array[i][j].trim();
          if (array[i][j].startsWith("{")) {
              for (let k = 0; k < array[i][j].length; k++) {
                  if (array[i][j][k] == ";") {
                      array[i][j] = array[i][j].replace(";", ",");
                  }
              }
          }
          titles[j] = titles[j].trim();
          obj[titles[j]] = array[i][j];
          
      }
      output.push(obj);
  }
  return output;
}

function main(index,source,map){
  /////////////// Enumuration///////////
  let yy=map[index]["Source"];
  if (yy.includes("ENUM")) {
    yy=yy.split("ENUM").join(" ");
    yy=yy.trim();
    yy=yy.split(" ");
    
    yy=yy[0];
    yy=yy.replace('(',"");
    yy=yy.replace(')',"");


    yy = yy.split(".").join("");


    let b = source;
      b = b[yy];

      let enu = JSON.parse(map[index]['Enumeration']);
      let str = enu[b];
    return str;
  }
  else{
  
  let kk = map[index].Source.split("+");
  let d="";
  for (let m in kk) {
      kk[m]=kk[m].trim();
      
    let aa = kk[m].split(".").join(" ");
    aa = aa.trim();
    let a = aa.split(" ");
      // console.log(a);
    let b = source;
      // console.log("b",b)
    for (let i of a) {
    
      b = b[i];
      
      
    }
  
    d+=b;
    d+=" ";
 
  }
  d=d.trim();
  console.log(d);
  return d;
}
}






function If_Else(target1,index,source,map,tar){

b = map[index].Source;
b=b.replace('(',"");
b=b.replace(')',"");
let i=b.indexOf("IF");
let j=b.indexOf("THEN");
let k=b.indexOf("ELSE");




let n=b.length;


if(i!=-1){
    let sIf=b.substring(i+2,j);

    let sThen=b.substring(j+4,k);
    let sElse=b.substring(k+4,n);
    sIf=sIf.trim();
    sThen=sThen.trim();
    sElse=sElse.trim();
   
    




  if(sIf.includes("item")){
      let str=sIf.split(".").join(" ");
      str=str.trim();
      tar = tar.split(".").join(" ")
      tar = tar.trim();

      sThen = sThen.split(".").join(" ");
      sThen = sThen.trim();
      




      if(str.includes('item')){
        str=str.split(" ");
        tar = tar.split(" ");
        sThen = sThen.split(" ");
        
        let count = 0;
        for(let i=0;i<str.length;i++){
          if(str[i] == tar[i]){
            count++;
          }else{
            break;
          }
        } 
        let count1 = 0;
        for(let i=0;i<str.length;i++){
          if(str[i] == sThen[i]){
            count1++;
          }else{
            break;
          }
        } 
        
        target1[tar[0]] = source[tar[0]];
        let b = source[str[0]];
        for(let i=1;i<tar.length;i++){
          if(tar[i] != 'item'){
            b = b[tar[i]];
          }else{
            i++;
            for(let element of b){
                
                if(element[str[count]]){
                  
                  element[tar[count]] = element[str[count]][0][sThen[count1]];
                  
                  
                }else{
                  element[tar[count]] = sElse;
                  
                }
            }

          }
        }

      }

      return ;
      





      // target1[bb]=source[bb];
      // let kk=source[bb];
      // let c=0;
      // for(let i=0;i<yy.length ;i++){
          
      //     if(yy[i]!="item" && i!=0){
      //         for(let uu of kk){
      //             if(uu[yy[i]]){
      //                 if(yy[i+1]!="item"){
      //                    target1[bb][c]["colletralvalue"]=uu[yy[i]][0][yy[i+1]];
      //                     i++;
      //                 }
      //             }else{
      //                 target1[bb][c]["colletralvalue"]=parseInt(s3);
      //             }c++;
      //         }
      //     }
      // }
  }
}




}





function maping(source , map){
  let target1 = {};
  
  for(let index = 0;index < map.length-1;index++){
    
      let a = map[index].Target;
      if (!a) continue;
      let b = map[index].Source;
      if (!b.includes("IF")) {
          target1[a] = main(index, source, map);
      }else{
          If_Else(target1,index,source,map,a);
      }
}
  return target1;
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
})

const upload = multer({
    storage: storage
});

const multipleUpload = upload.fields([{ name: 'jsonInput'}, { name: 'csvInput'}]);

app.post('/uploadFile', multipleUpload, async (req, res) => {
    const f = await fs.readFileSync(path.join(__dirname, req.files.jsonInput[0].path));
    const input = JSON.parse(f);
    
    const data = await fs.readFileSync(path.join(__dirname, req.files.csvInput[0].path)).toLocaleString();
    let map = CSV(data);
    
    const jsonOutput = maping(input,map);
    
    const jsonString = JSON.stringify(jsonOutput, null, 2);
    fs.writeFileSync('./newCustomer.json', jsonString)

    res.render('output', { jsonString });
});

app.get('/download', (req, res) => {
    res.download('./newCustomer.json');
})

app.get('/', (req, res) => {
    res.render('home');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Serving on port ${port}`);
});



