var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');


var template = {
  //function
  HTML : function(title, list, body, control){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list :function(filelist){
    var list = '<ul>';
    var i = 0;
    while(i < filelist.length){
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  }
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/'){  //HOME
      if(queryData.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`);//혼에는 업데이트가 없다
          response.writeHead(200);
          response.end(html);
        });
      } else {
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = template.list(filelist);
            var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`,
              `<a href="/create">create</a>
               <a href="/update?id=${title}">update</a>
               <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
               </form>`);
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){  // 글 작성 페이지
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, ' ');
        response.writeHead(200);
        response.end(html);
      });
    }else if (pathname === '/create_process') {
      //사용자에게 제목과 내용을 입력받음
      var body = '';
      request.on('data', function(data){  //웹 브라우저가 post방식일시 데이터가 많은 경우
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        //post 방식으로 데이터를 받았음
        var title = post.title;
        var description = post.description;
        //받은 데이터로 파일 작성
        fs.writeFile(`data/${title}`, description, 'utf8',
        function(err){
          response.writeHead(302, {Location : `/?id=${title}`}); //리다이렉션
          response.end();
        })
      });
    } else if (pathname === '/update') {  // 글 수정 페이지
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,    //id를 통해 수정 전의 제목을 기록
            `
            <form action="/update_process" method="post">
            <input type="hidden" name="id" value=${title}>
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if (pathname === '/update_process') {
      var body = '';
      request.on('data', function(data){  //웹 브라우저가 post방식일시 데이터가 많은 경우
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        //post 방식으로 데이터를 받았음
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(error){ // 기존 파일의 이름 변경
          //내용 변경
          fs.writeFile(`data/${title}`, description, 'utf8',
          function(err){
            response.writeHead(302, {Location : `/?id=${title}`}); //리다이렉션
            response.end();
        })
        })
      });
    } else if (pathname === '/delete_process') {
      var body = '';
      request.on('data', function(data){  //웹 브라우저가 post방식일시 데이터가 많은 경우
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        //post 방식으로 데이터를 받았음
        var id = post.id;
        fs.unlink(`data/${id}`, function(error){
            response.writeHead(302, {Location : `/`}); //홈으로 리다이렉션
            response.end();
        })
      });
    } else {  //ERROR
      response.writeHead(404);
      response.end('Not found');
    }



});
app.listen(3000);
