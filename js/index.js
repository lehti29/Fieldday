var displaygroup = [];

function initSidebar() {
  $('.ui.sidebar').first()
  .sidebar('setting', 'transition', 'overlay')
  .sidebar('setting', 'mobileTransition', 'overlay')
  .sidebar('attach events', '#sidebarToggle');

  $("#sidebarToggle")
  .removeClass('disabled');
}

function initCheckboxes() {
  var groupboxes = $('#groupBoxes');
  groupboxes.html("");
  if(localStorage.loggedInUserGroups) {
    var groups = JSON.parse(localStorage.loggedInUserGroups);
    var dispGroups = localStorage.displayedGroups.split(",");
    Object.keys(groups).forEach((group)=>{
      if(groups[group] != null) {
        var groupnr = groups[group].groupId;
        var checked = "";
        if(dispGroups.includes(groupnr)){
          checked = "checked";
        }

        var div = ['<div class="inline field"><div class="ui checkbox"><input type="checkbox" id="group', 
        groupnr, '"', checked, '><label for="group', groupnr, '">Group ', groupnr, '</label></div></div>'].join("");
        groupboxes.append(div);
      }
    });
    
    $('.checkbox').checkbox().checkbox({
      onChecked: function() {
        var group = this.id.split("group")[1];
        if(!displaygroup.includes(this.id)){
          displaygroup.push(group);
        }
        localStorage.displayedGroups = displaygroup;
        showMarkers(group);
      },
      onUnchecked: function() {
        var pos = displaygroup.indexOf(this.id);
        displaygroup.splice(pos, 1); //removes 1 item on index pos
        localStorage.displayedGroups = displaygroup;
        var group = this.id.split("group")[1];
        hideMarkers(group);
      },
      onChange: function() {
        console.log("Change called on child: ", this.id, ' with displaygroup: ', displaygroup);
      }
    });
  }
  groupboxes.append('<button class="ui olive button" onclick="addUserToGroup();"><i class="plus icon"></i> Join group</button>');
}

fillUserView = function() {
  document.getElementById("displayUsername").innerHTML = localStorage.loggedInUser;
  document.getElementById("displayMail").innerHTML = localStorage.loggedInUserMail;
  document.getElementById("displayImg").src = localStorage.loggedInUserImg;
}

initLogin = function() {
  if(localStorage.loggedInUser) {
    fillUserView();    
    initCheckboxes();
  } else {
    console.log("init new login")
    $('.modal.coupled').modal({
      allowMultiple: true
    })
    $('#login')
      //.modal('attach events', '#openLogin.button', 'show')
      .modal('setting', 'closable', false)
      .modal('show');
      ;
    $('#createnewuser')
      .modal('attach events', '#createnewuserbutton');
  }
}

logout = function() {
  localStorage.clear();
  deleteMarkers();
  initLogin();
}


initLogin();
initSidebar();