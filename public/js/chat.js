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
          $('#regWrap').hide();
          $contentWrap.show();
          $messageBox.focus();
          $user.prepend("  "+username);
          pullMessage('#general');
          chatBoxautoScroll()
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
                $('#userWrap').hide();
                $contentWrap.show();
                $messageBox.focus();
                $user.prepend("  "+username);
                pullMessage('#general');
                //last_msg_display = $('ul#chat li:last-child').attr('id');
                chatBoxautoScroll()
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
        for(i = 0; i < userList.length; i++) {   
         var _data = {usertable: username, chat_pair: userList[i]};         
          socket.emit('get unread chat', _data, function(data) {
            var count = data[0].count;
          if (count != 0) {
            $('span#'+data[0].user_update+'').css({'font-weight':'bold', 'color': 'blue'});
            count++
           $( "span#notify_"+data[0].user_update).html(' '+count);
          }
        })
       }  

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
            pullMessage(chatLabel);


            chatBoxautoScroll()
            }); 
          });
        });

      function chatBoxautoScroll() { 
        $('#msgWrap').animate({scrollTop: $('#msgWrap').prop("scrollHeight")}, 'slow');
        }

      function refreshLabel() {       
         $chatLabel.ready(function() {
            chatLabel = $chatLabel.text().substr(1);          
            });
          }
    
      function pullMessage(label) {      
        socket.emit('pull message', label, function(data) {
          if(data) {
            $('#btn_send_msg').removeAttr('disabled');
            }
         });
        last_msg_display = $('ul#chat li:last-child').attr('id');
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
        for(var i = 0; i < data.length; i++) { 
              var user = data[i]['username'];
              if (i > 0) var prev_user = data[i-1]['username'];
              var msg = data[i]['chat'];
              var time = formatTime(data[i]['date_created']);
              if (user == username) {
                  if (user == prev_user) {
                      var html = '<li class="mar-btm left-pull-margin" id="left-display">'+
                             '<div class="media-body pad-hor"><div class="speech_a">'+
                            '<div style="float:left"><p>'+ msg +'</p></div>'+
                            '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ time +'</p>'+
                            '</div></div></div>'+
                           '</li>';
                      } else {
                       var html = '<li class="mar-btm" id="left-display"><div class="media-left">'+
                            '<img src="http://placehold.it/45/b7dcfe" '+
                            'class="img-circle img-sm" alt="Profile Picture"></div>'+
                             '<div class="media-body pad-hor"><div class="speech">'+
                            '<span href="#" class="media-heading">'+ user +'</span>'+
                           '<div style="float:left"><p>'+ msg +'</p></div>'+
                            '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ time +'</p>'+
                            '</div></div></div>'+
                           '</li>';
                      } 
              } else {
                 if (user == prev_user) {
                      var html = '<li class="mar-btm right-pull-margin" id="right-display">'+
                         '<div class="media-body pad-hor speech-right"><div class="speech_b">'+
                        '<div style="float:left"><p>'+ msg +'</p></div>'+
                        '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ time +'</p>'+
                        '</div></div></div>'+
                       '</li>';
                } else {
                      var html = '<li class="mar-btm" id="right-display"><div class="media-right">'+
                        '<img src="http://bootdey.com/img/Content/avatar/avatar2.png" '+
                        'class="img-circle img-sm" alt="Profile Picture"></div>'+
                         '<div class="media-body pad-hor speech-right"><div class="speech">'+
                        '<span href="#" class="media-heading">'+ user +'</span>'+
                        '<div style="float:left"><p>'+ msg +'</p></div>'+
                        '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ time +'</p>'+
                        '</div></div></div>'+
                       '</li>';
                  }
              }              
              $chat.append($('<li>').html(html)); 
          }          
        }

      socket.on('chat backup display', function(data) {
        updateChatBox(data);
        });

      socket.on('private chat backup', function(data) {
        updateChatBox(data);
        });

      $messageForm.submit( function(e) {
        e.preventDefault();
        refreshLabel();
        var message = $messageBox.val();
        socket.emit('user done typing', username);
        if (/([^\s])/.test(message)) {
          socket.emit('send message', { msg: message, label: chatLabel, user: username}, function(data) {

        var now = getTime();

			  if(data && chatLabel != username) {
				  if (last_msg_display == 'left-display') {
					var html = '<li class="mar-btm left-pull-margin" id="left-display">'+
							   '<div class="media-body pad-hor"><div class="speech_a">'+
								'<div style="float:left"><p>'+ data +'</p></div>'+
								'<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
								'</div></div></div>'+
							 '</li>';
				  } else {
					 var html = '<li class="mar-btm" id="left-display"><div class="media-left">'+
								'<img src="http://bootdey.com/img/Content/avatar/avatar1.png" '+
								'class="img-circle img-sm" alt="Profile Picture"></div>'+
							   '<div class="media-body pad-hor"><div class="speech">'+
                 '<span href="#" class="media-heading">'+ username +'</span>'+
								'<div style="float:left"><p>'+ data +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
							 '</li>';
				  } 

          last_msg_display = 'left-display';
				  
				  //attach chat
				  $chat.append(html);						  
          
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

        if (last_msg_display == 'right-display') {
              var html = '<li class="mar-btm right-pull-margin" id="right-display">'+
                 '<div class="media-body pad-hor speech-right"><div class="speech_b">'+
                '<div style="float:left"><p>'+ data.msg +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
               '</li>';
        } else {
              var html = '<li class="mar-btm" id="right-display"><div class="media-right">'+
                '<img src="http://bootdey.com/img/Content/avatar/avatar2.png" '+
                'class="img-circle img-sm" alt="Profile Picture"></div>'+
                 '<div class="media-body pad-hor speech-right"><div class="speech">'+
                '<span href="#" class="media-heading">'+ data.user +'</span>'+
                '<div style="float:left"><p>'+ data.msg +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
               '</li>';
          }

        last_msg_display = 'right-display';
        
        refreshLabel()
        if (chatLabel == '#general') {
            $chat.append($('<li>').html(html)); 
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
        if (chatLabel == username) {
            if (last_msg_display == 'left-display') {
              var html = '<li class="mar-btm left-pull-margin" id="left-display">'+
                     '<div class="media-body pad-hor"><div class="speech_a">'+
                    '<div style="float:left"><p>'+ data +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
                   '</li>';
              } else {
               var html = '<li class="mar-btm" id="left-display"><div class="media-left">'+
                    '<img src="http://bootdey.com/img/Content/avatar/avatar1.png" '+
                    'class="img-circle img-sm" alt="Profile Picture"></div>'+
                     '<div class="media-body pad-hor"><div class="speech">'+
                    '<span href="#" class="media-heading">'+ username +'</span>'+
                    '<div style="float:left"><p>'+ data +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
                   '</li>';
              } 

              last_msg_display = 'left-display';

        } else {
          if (last_msg_display == 'right-display') {
              var html = '<li class="mar-btm right-pull-margin" id="right-display">'+
                 '<div class="media-body pad-hor speech-right"><div class="speech_b">'+
                '<div style="float:left"><p>'+ data.msg +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
               '</li>';
        } else {
              var html = '<li class="mar-btm" id="right-display"><div class="media-right">'+
                '<img src="http://bootdey.com/img/Content/avatar/avatar2.png" '+
                'class="img-circle img-sm" alt="Profile Picture"></div>'+
                 '<div class="media-body pad-hor speech-right"><div class="speech">'+
                '<span href="#" class="media-heading">'+ data.user +'</span>'+
                '<div style="float:left"><p>'+ data.msg +'</p></div>'+
                '<div style="float:right"><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>'+ now +'</p>'+
                '</div></div></div>'+
               '</li>';
          }

        last_msg_display = 'right-display';




        } 
        if (chatLabel == data.user) {
              $chat.append($('<li>').html(html));
              chatBoxautoScroll()
              callback('read')
        } else {
            var count = $('span#notify_'+data.user).text();
            $('span#'+data.user+'').css({'font-weight':'bold', 'color': 'blue'});
            count++
           $( "span#notify_"+data.user).html(' '+count);
           callback('unread')
        }      
                  
    }); 

      $('#demo-disconnect-chat').on('click', function() {
        socket.emit('disconnect');
        socket.disconnect(true);
        socket.removeAllListeners();
      })
});
