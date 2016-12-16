$(function($) {
      var socket = io.connect();
      var $messageForm = $('#send-message');
      var $messageBox = $('#message');
      var $chat = $('#chat');
      var $contentWrap = $('#contentWrap');
      var $usernameForm = $('#usernameForm');
      var $userBox = $('#userBox');
      var $error = $('#error');
      var $usernameBox = $('#username');
      var $reg_usernameBox = $('#reg_username');
      var $chatLabel = $('#chatLabel');
      var $info = $('#info');
      var $info_typing = $('#info_typing');
      var chatLabel = '#general';
      var username = '';
      var $user = $('#user'); 
      var $pw = $('#password');    
      var $password = $('#reg_password');
      var $confirm_password = $('#password2');
      var pass = false;
      var url = '';
      var general_count = '';
      var last_msg_display = '';
      var users_avatar = {};
      var displayedChatInfo = {};
      var privateChatInfo = {};

/****************************************users avatar***********************************/
    // user choose avatar_modal box
      $('#modal-body-img img').on('click', function () {
        var av_id = $(this).attr('name');
        users_avatar[username] = av_id;
        updateAvatar(username);
        socket.emit('user avatar change', av_id);
      });

      socket.on('update users avatar', function(data) {
          users_avatar = data;
        })

      socket.on('refresh prompt', function(data) {
        url = data;
      })

      $(document).ready(function() {
        $('userWrap').ready(function() {
          $usernameBox.focus();  
          });
        $('p#reg_click').click(function() {
            $('#userWrap').hide();
            $('#regWrap').show();
            $reg_usernameBox.focus(); 
            }) 
        $('p#login_click').click(function() {
            $('#regWrap').hide();
            $('#userWrap').show();
            $usernameBox.focus(); 
            }) 

        $('chatWrap').ready(function() {
          $messageBox.focus();
          })        
        
        $('#regForm').submit( function(e) {
          e.preventDefault();
          if(pass) {
              $info.html('');              
              socket.emit('new user', {username: username, password: $password.val()})               
          } else {
              $error.html('Username taken');
              $reg_usernameBox.keypress(function(){
                $error.html('');
                });
              }
            });
          });

        $reg_usernameBox.on('blur', function() {
          var username_val = ($reg_usernameBox.val()).trim();
            socket.emit('check user', username_val, function(data){
            if(!data) {
              $error.html('Username taken');
              $reg_usernameBox.keypress(function(){
                $error.html('');
                });
            } else {
                pass = true;
                username = username_val;
              }
            });
        });
        
        socket.on('login', function() {
          $('#headerWrap').hide();
          $contentWrap.show();
          updateAvatar(username);
          $messageBox.focus();
          $user.prepend("  "+username);
          pullMessage({label: '#general', page: 0});
          refreshLabel();
        })  
          
        $password.on('change', function() {
          if($password.val() != $confirm_password.val()) {
            $error.html("Passwords don't match");
          } else {
              $('#reg_submit').removeAttr('disabled');
            }
          })
            .on('input', 'keydown', function() {
            $error.html('');
          });

        $confirm_password.on('keyup', function() {
          if($password.val() != $confirm_password.val().substr(0,$password.val().length) || $password.val().length != $confirm_password.val().length) {
              $error.html("Passwords don't match");
              } else {
               $('#reg_submit').removeAttr('disabled');
              }
            })
        .on('input', function() {
            $error.html('');
        });     
           
      $usernameForm.submit( function(e) {
        e.preventDefault();

        var user = {username: ($usernameBox.val()).trim(), password: $pw.val()};
        socket.emit('check user/password', user, function(data){
          if(data) {
            username = user.username;
            socket.emit('user logged in', username, function(data) {
              if(data) {
                $info.html('');
                $('#headerWrap').hide();
                $contentWrap.show();               
                $messageBox.focus(); 
                updateAvatar(username);
                $user.prepend("  "+username);
                pullMessage({label: '#general', page: 0});
                refreshLabel();
              } else {
                $error.html('User already logged in.');
                $usernameBox.focus();
                $usernameBox.keypress(function(){
                    $error.html('');
                  });
                $pw.keypress(function(){
                    $error.html('');
                  });
                }              
            });            
          } else {

              if (url != '') {
                $error.html('Incorrect username or password.');
                $usernameBox.focus();
                $usernameBox.keypress(function(){
                    $error.html('');
                  });
                $pw.keypress(function(){
                    $error.html('');
                  });
              } else {
                  $error.html('Error!!! Refresh page and try again.');
                  $usernameBox.focus();
                  $usernameBox.keypress(function(){
                    $error.html('');
                  });
                  $pw.keypress(function(){
                    $error.html('');
                  });
              }
            }
          });
          $usernameBox.val('')
          $pw.val(''); 
          });

      socket.on('broadcast user status', function(data) {
        if(data) {
          $info.html(data);
          //need a plugin that will do this efficiently
          $info.ready(function() {
              setTimeout(function() {
                $info.html('')
              }, 5000);
            })
          }
        });
        
      $messageBox.on('input', function() {
          refreshLabel();
          socket.emit('user typing', {user:username, label: chatLabel});
        });

      $messageBox.on('keyup', function() {
        setTimeout(function() {
                socket.emit('user done typing', username)
              }, 10000);
        });

      socket.on('display user typing', function(data) { 
        refreshLabel();       
        if (chatLabel == '#general') {
          $info_typing.html(data.user + ' is typing...');         
      } 
      });

      socket.on('private user typing', function(data) {
        refreshLabel();
        if (chatLabel == data.user && chatLabel != username) {
          $info_typing.html(data.user + ' is typing...'); 
        } else if (chatLabel != data.user) {
        $info_typing.html(data.user + ' is typing a private message to you...'); 
         }
      });        

      socket.on('remove user typing', function(data) {
        $info_typing.html('');
        });
      
      socket.on('users', function(data) {
        var userList = data.users;   
        
        var html = "<p><span class='userList' id='general'>#general</span><span class='notifyCount' id='notify_general'>"+general_count+"</span></p>";

        for(i = 0; i < userList.length; i++) {  
          if(userList[i] == username) continue;          
          html += "<p><span class='userList' id='"+userList[i]+"'>"+userList[i]+"</span><span class='notifyCount' id='notify_"+userList[i]+"'></span></p>";          
       }               
        $userBox.html(html); 

        //update offline msg notification for private chats
        socket.emit('get unread chat', {user: username}, function(data) {
            for(i = 0; i < userList.length; i++) {   
              for(j = 0; j < data.length; j++) {   
                if(data[j]["count"] > 0 && userList[i] == data[j]["user1"]) {
                  var count = data[j]["count"];
                  $('span#'+data[j]["user1"]+'').css({'font-weight':'bold', 'color': 'blue'});
                  count++
                  $( "span#notify_"+data[j]["user1"]).html(' '+count);
                }
              }
            }        
        }) 

         //update offline msg notification for general chats
         if (general_count > 0) {
            $('span#general').css({'font-weight':'bold', 'color': 'blue'});
            $('span#notify_general').html(' '+general_count);
         }

            
        //span click
        $('span.userList').ready(function(){
           $('span.userList').click( function(e){       
            $('#btn_send_msg').attr('disabled','true'); 
            $chat.empty();
            $messageBox.val('');
            $messageBox.focus();

            var _thistext = $(this).text();
            
            $chatLabel.html('@' + _thistext);
            chatLabel = _thistext;
          if (chatLabel == '#general') {
              $('span#general').css({'font-weight':'normal', 'color': 'black'})
              $( "span#notify_general").html('');
            } else {
              socket.emit('flag as read', chatLabel);
               $('span#'+chatLabel+'').css({'font-weight':'normal', 'color': 'black'})
               $( "span#notify_"+ _thistext).html('');
            }  
            pullMessage({label: chatLabel, page: 0});
            }); 
          });
        });

      function updateAvatar(user) {
         var av_id = users_avatar[user];
        $('#my_avatar').html('<img src="/images/'+av_id+'.png" name=1 class="img-xm img-circle" alt="Profile Picture">')
      }

      function chatBoxautoScroll() { 
          // $('#msgWrap').animate({scrollTop: $('#msgWrap').prop("scrollHeight")}, '10000');
          $('#msgWrap').scrollTop($('#msgWrap').prop("scrollHeight"));
        }            

      function refreshLabel() {       
         $chatLabel.ready(function() {
            chatLabel = $chatLabel.text().substr(1);          
            });
          }
    
      function pullMessage(data) {      
        socket.emit('pull message', data, function(data) {
          if(data) {
            $('#btn_send_msg').removeAttr('disabled');
            }
         });
       
      }

      function getTime() {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var now = hours + ':' + minutes + '' + ampm;
        return now;
      }

      function formatTime(data) {
        var date = new Date(data);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        // var day = date.getDay() + 1;
        // var month = date.getMonth() + 1;
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var time = hours + ':' + minutes + ampm 
        return time;
      }



      function updateChatBox(data) {  
        var html = ''; 
        var rows = data.rows;
        if(rows) { 
            for(var i = rows.length - 1; i >= 0; i--) { 
                  var user = rows[i]['username'];
                  if (i < rows.length - 1) var prev_user = rows[i+1]['username'];
                  var msg = rows[i]['chat'];
                  var time = formatTime(rows[i]['date_created']);
                  if (user == username) {
                      if (user == prev_user) {
                           html += '<li class="mar-btm left-pull-margin">'+
                                 '<div class="media-body pad-hor"><div class="speech_a">'+
                                '<div style="float:left"><p id="'+ username +'" class="p-display">'+ msg +'</p></div>'+
                                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ time +'</p>'+
                                '</div></div></div>'+
                               '</li>';
                      } else {
                           var av_id = users_avatar[user];
                            html += '<li class="mar-btm"><div class="media-left">'+
                                '<img src="/images/'+av_id+'.png" '+
                                'class="img-circle img-sm" alt="Profile Picture"></div>'+
                                 '<div class="media-body pad-hor"><div class="speech">'+
                                '<span href="#" class="media-heading">'+ user +'</span>'+
                               '<div style="float:left"><p id="'+ user +'" class="p-display">'+ msg +'</p></div>'+
                                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ time +'</p>'+
                                '</div></div></div>'+
                               '</li>';
                          }
                  } else {
                     if (user == prev_user) {
                           html += '<li class="mar-btm right-pull-margin">'+
                             '<div class="media-body pad-hor speech-right"><div class="speech_b">'+
                            '<div style="float:left"><p id="'+ user +'" class="p-display">'+ msg +'</p></div>'+
                            '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ time +'</p>'+
                            '</div></div></div>'+
                           '</li>';
                    } else {
                          var av_id = users_avatar[user];
                           html += '<li class="mar-btm"><div class="media-right">'+
                            '<img src="/images/'+av_id+'.png" '+
                            'class="img-circle img-sm" alt="Profile Picture"></div>'+
                             '<div class="media-body pad-hor speech-right"><div class="speech">'+
                            '<span href="#" class="media-heading">'+ user +'</span>'+
                            '<div style="float:left"><p id="'+ user +'" class="p-display">'+ msg +'</p></div>'+
                            '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ time +'</p>'+
                            '</div></div></div>'+
                           '</li>';
                      }
                  }                
              }  

          if (data.pagination.current == 0) {
              $chat.append(html); 
              chatBoxautoScroll();   
          } else {
              var scroll_to = $('#msgWrap').prop("scrollHeight")
              $chat.prepend(html);
              $('#msgWrap').scrollTop($('#msgWrap').prop("scrollHeight") - scroll_to);
            }
          }
        }

      socket.on('chat backup display', function(data) {
        displayedChatInfo = data.pagination;
        updateChatBox(data);
        });

      // scrollTop($('#msgWrap').prop("scrollHeight")

      $('#msgWrap').scroll( function() {
        if (displayedChatInfo) {
            var numOfPages = displayedChatInfo.numOfPages;
            var page = displayedChatInfo.current;

            if (page < numOfPages) {
              if($('#msgWrap').prop("scrollTop") == 0) {
                refreshLabel();
                pullMessage({label: chatLabel, page: displayedChatInfo.next})
              }
            }
          }
      })         

      socket.on('private chat backup', function(data) {         
        updateChatBox(data);
        });

      $messageForm.submit( function(e) {
        e.preventDefault();
        refreshLabel();
        var message = $messageBox.val();
        socket.emit('user done typing', username);
        if (/([^\s])/.test(message)) {
          socket.emit('send message', { msg: message, pair: chatLabel, user: username}, function(data) {

        var now = getTime();
        if(data) {
          var last_msg_display = $('p.p-display').last().attr('id');
          if (last_msg_display == username) {
              var html = '<li class="mar-btm left-pull-margin">'+
                   '<div class="media-body pad-hor"><div class="speech_a">'+
                  '<div style="float:left"><p id="'+ username +'" class="p-display">'+ data +'</p></div>'+
                  '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                  '</div></div></div>'+
                 '</li>';
          } else {
              var av_id = users_avatar[username];
              var html = '<li class="mar-btm"><div class="media-left">'+
                  '<img src="/images/'+av_id+'.png" '+
                  'class="img-circle img-sm" alt="Profile Picture"></div>'+
                   '<div class="media-body pad-hor"><div class="speech">'+
                   '<span href="#" class="media-heading">'+ username +'</span>'+
                  '<div style="float:left"><p id="'+ username +'" class="p-display">'+ data +'</p></div>'+
                  '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                  '</div></div></div>'+
                 '</li>';
          } 
          
          //attach chat
          $chat.append(html);             
          last_msg_display = $('p.p-display').last().attr('id');
          //wrap and adjust scrolling efect
          chatBoxautoScroll();
            }
          });                   
        }
          $messageBox.val('');
        });

      // var _socket = io('/'+chatLabel);
      //   socket.on('private',function(data){

      // });


      socket.on('new message', function(data, callback) {
        
        var now = getTime();
        var last_msg_display = $('p.p-display').last().attr('id');
        if (last_msg_display == data.user) {
              var html = '<li class="mar-btm right-pull-margin"">'+
                 '<div class="media-body pad-hor speech-right"><div class="speech_b">'+
                '<div style="float:left"><p id="'+ data.user +'" class="p-display">'+ data.msg +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
               '</li>';
        } else {
              var av_id = users_avatar[data.user];
              var html = '<li class="mar-btm"><div class="media-right">'+
                '<img src="/images/'+av_id+'.png" '+
                'class="img-circle img-sm" alt="Profile Picture"></div>'+
                 '<div class="media-body pad-hor speech-right"><div class="speech">'+
                '<span href="#" class="media-heading">'+ data.user +'</span>'+
                '<div style="float:left"><p id="'+ data.user +'" class="p-display">'+ data.msg +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
               '</li>';
          }
        
        refreshLabel()
        if (chatLabel == '#general') {
            $chat.append(html); 
            chatBoxautoScroll()
        } else {
            var count = $('span#notify_general').text();
            $('span#general').css({'font-weight':'bold', 'color': 'blue'});
            count++
            $('span#notify_general').html(' '+count);
            general_count = count;
          }           
        });

      socket.on('private message', function(data, callback){
        refreshLabel()  
        var now = getTime();

        /**** send message to self ***********/

        if (data.user == username) {
            var last_msg_display = $('p.p-display').last().attr('id');
            if (last_msg_display == username) {
              var html = '<li class="mar-btm left-pull-margin">'+
                     '<div class="media-body pad-hor"><div class="speech_a">'+
                    '<div style="float:left"><p id="'+ data.user +'" class="p-display">'+ data +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
                   '</li>';
              } else {
               var av_id = users_avatar[username];
               var html = '<li class="mar-btm"><div class="media-left">'+
                    '<img src="/images/'+av_id+'.png" '+
                    'class="img-circle img-sm" alt="Profile Picture"></div>'+
                     '<div class="media-body pad-hor"><div class="speech">'+
                    '<span href="#" class="media-heading">'+ username +'</span>'+
                    '<div style="float:left"><p id="'+ data.user +'" class="p-display">'+ data +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
                   '</li>';
              } 


        } else {
          var last_msg_display = $('p.p-display').last().attr('id');
          if (last_msg_display == data.user) {
              var html = '<li class="mar-btm right-pull-margin">'+
                 '<div class="media-body pad-hor speech-right"><div class="speech_b">'+
                '<div style="float:left"><p id="'+ data.user +'" class="p-display">'+ data.msg +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
               '</li>';
        } else {
              var av_id = users_avatar[data.user];
              var html = '<li class="mar-btm"><div class="media-right">'+
                '<img src="/images/'+av_id+'.png" '+
                'class="img-circle img-sm" alt="Profile Picture"></div>'+
                 '<div class="media-body pad-hor speech-right"><div class="speech">'+
                '<span href="#" class="media-heading">'+ data.user +'</span>'+
                '<div style="float:left"><p id="'+ data.user +'" class="p-display">'+ data.msg +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
               '</li>';
          }
             } 
        if (chatLabel == data.user) {
              $chat.append(html);
              chatBoxautoScroll()
              callback('read')
        } else {
            var count = $('span#notify_'+data.user).text();
            $('span#'+data.user+'').css({'font-weight':'bold', 'color': 'blue'});
            count++
           $( "span#notify_"+data.user).html(' '+count);
           callback(true)
        }                   
    }); 

      $('#demo-disconnect-chat').on('click', function() {
        socket.emit('disconnect');
        socket.disconnect(true);
        socket.removeAllListeners();
      })
});
