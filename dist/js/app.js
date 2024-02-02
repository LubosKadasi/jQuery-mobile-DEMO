$(document).on("pagecreate", "#matches-page", function () {
  // Načítanie dát zo súboru events.json
  $.getJSON("./data/events.json", function (data) {
      // Zoradenie zápasov podľa dátumu
      data.sort(function (a, b) {
          return new Date(a.startDate) - new Date(b.startDate);
      });

      // Pridanie informácie o tom, či zápas už bol v minulosti
      var currentDate = new Date();
      
      $.each(data, function (index, match) {
        match.wasPlayed = new Date(match.startDate) < currentDate;
        
        // formátovanie názvu zápasu
        var nameHtml = match.name;
        match.nameHtml = nameHtml.replace("vs.", "<small>vs.</small>");

        // pridanie indexu pre porovnávanie a zobrazenie informácie o ďalšom zápase v poradí, ktorý nie je disabled
        match.index = index;
      });

      // Vytvorenie skupín zápasov podľa dňa
      var groupedMatches = {};
      $.each(data, function (index, match) {
          var date = new Date(match.startDate).toLocaleDateString();
          if (!groupedMatches[date]) {
              groupedMatches[date] = [];
          }
          groupedMatches[date].push(match);
      });

      // Vykreslenie tlačidiel a skupín
      var matchesContent = $("#matches-content");
      $.each(groupedMatches, function (date, matches) {
        
        // Vytvorenie skupiny
        var eventGroup = $("<div class='event-group'></div>");
        
        // Vykreslenie dátumu nad skupinou
        eventGroup.append("<h4>" + date + "</h4>");

        // Vykreslenie tlačidiel zápasov v skupine
          var groupList = $("<ul data-role='listview' class='event-list'></ul>");
          $.each(matches, function (index, match) {
              var button = $("<a href='#match-popup' data-rel='popup' data-position-to='window' data-transition='pop' class='event' data-index='" + match.index + "'>⚽ " + match.nameHtml + "</a>");
              button.data("match", match);
              if (match.wasPlayed){
                button.addClass('event-past')
              }
              groupList.append($("<li></li>").append(button));
          });

          // Pridanie zoznamu do skupiny
          eventGroup.append(groupList);
          // Pridanie skupiny do obsahu
          matchesContent.append(eventGroup);
      });

      // Inicializácia jQuery Mobile komponentov
      matchesContent.trigger("create");

      // Obsluha kliknutia na tlačidlo zápasu
      $("a[href='#match-popup']").on("click", function () {
          var match = $(this).data("match");
          showMatchPopup(match);
      });
  });
});

function showMatchPopup(match) {
  // Vykreslenie obsahu popup-u
  $("#match-popup-content").html("<h2>" + match.nameHtml + "</h2>" +
      "<p>Dátum: <strong>" + new Date(match.startDate).toLocaleDateString() + "</strong> | <strong> " + new Date(match.startDate).toLocaleTimeString() + "</strong>" +
      "<p>pravdepodobný víťaz: <strong>" + match.possibleWinner + "</strong></p>");

  // Ak sa zápas už odohral, zobraz odporúčanie
  if (new Date(match.startDate) < new Date()) {
      $("#match-popup-content").append("<p class='notification'>Zápas už bol odohraný. Pozrite si detail ďalšieho zápasu: <span class='notification-placeholder'></span></p>");
  }
}

// handlovanie stavov po kliknutí na zápas, ktorý sa už odohral
$(document).on('click', '.event-past', function(e){

  // index kliknutého tlačidla
  elIndex = Number($(e.target).data('index'));
  
  // Zakázanie tlačidla po kliknutí na zápas v mynulosti
  $(e.target).addClass('ui-disabled');
  
  // Zafarbenie zoznamu zápasov v skupine ak sú "disabled" 1 alebo viac tlačidiel
  var eventGroup = $(e.target).parents('.event-group');
  if ($(eventGroup).hasClass('list-warning')){
    $(eventGroup).addClass('list-error');
  } else {
    $(eventGroup).addClass('list-warning');
  }
  
  // porovnanie a zobrazenie informácie o ďalšom zápase v poradí, ktorý nie je disabled
  $('.event').each(function (index) {
    if (($(this).hasClass('ui-disabled') == false) && index > elIndex){
      $('.notification-placeholder').text(this.text);
      return false;
    }
  });

});