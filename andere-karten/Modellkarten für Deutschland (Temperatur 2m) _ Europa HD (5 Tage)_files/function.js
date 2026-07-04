var gtag = function() {};
var ajaxloadingdelay = false;
var ajaxloadingarchivemsg = false;
var block_hiding_loadinglayer_when_loading = false;
var graphwidth = 0;
var keydown    = 0;
var no_reload  = true;
var last_param_id = 0;
var images=[];         // buffers for preloading loop images
var gifimages=[];        // buffers for preloading gif images
var gifonce = true;
var gifimages_loaded=0;
var loaded_image_sources = [];
var images_loaded =0;  
var images_waiting=0;
var images_speed=5; // 0-10 different speeds
var images_delay=[1000,750,400,200,160,140,120,100,90,80,70];
images_delay=[1000/1,1000/2,1000/3,1000/4,1000/5,1000/6,1000/8,1000/10,1000/12,1000/14,1000/16,1000/18,1000/20,1000/25];
var images_extend_max =8; 
var images_extend     =1; 
var images_islast     =0; 
var compact_interval=3;
var loading=0;
var popover_status = [];
var favtoggle_status = 'hide';
var adblock_txt = '<div class="abtextout"><div class="abtext"><p>Liebe Benutzerinnen und Benutzer von kachelmannwetter.com</p><p>Unsere Seite hat viele Angebote, die es nirgendwo anders gibt: Stormtracking, Blitzanalyse, Hagelalarm für Deutschland, Schweiz, Österreich und Luxemburg, das SuperHD-Modell mit 1x1 km Auflösung, weltweit viele Parameter des ECMWF-Modells und vieles mehr.</p><p>Dass es das anderswo nicht gibt, hat seinen Grund. Es ist uns was wert, tolle Menschen in der Firma zu haben, die das können, und Daten einzukaufen, die andere nicht haben und damit einen noch besseren Service zu bieten.</p></div><div class="abtext"><p>Das Ganze beruht irgendwie auf der Annahme, dass die User ahnen, dass wir Daten und Gehälter, die das möglich machen, irgendwie finanzieren müssen. Wir werden deshalb in naher Zukunft drei Dinge tun, damit alle etwas beitragen können.</p><p>1. Die Seite wird weiterhin Werbung haben.</p><p>2. Wer keine Werbung mag, wird für wenig Geld eine werbefreie Seite bekommen und für etwas mehr als wenig, aber immer noch wenig Geld eine werbefreie Seite mit zusätzlichen exklusiven Funktionen bekommen.</p></div><div class="abtext"><p>3. Wer einen Adblocker hat und sich nicht solidarisch in unserem UnterstützerInnen-Kollektiv engagieren möchte, wird unsere Seite leider nicht mehr sehen können.</p><p>Wir freuen uns auf alle, die bei uns bleiben - es ändert sich fast nichts und das Angebot wird wie bisher laufend ausgebaut. Wir sind noch lange nicht fertig und voller Ideen und Tatendrang.</p><p>Herzlich<br />Team Kachelmann GmbH</p></div><div style="clear:both;"></div></div>';
var adblock_txt2 = '<div class="abtextout"><p>Werbefläche</p></div>';
var download_image = null;
var download_gif_blob = null;
var is_playing_first = true;
var chartcounter=2;
var xclicksvalue=0;
var open_dd_div1='';
var open_dd_div2='';
var open_dd_tab_valids='';
var open_dd_tab_models='';
var open_dd_tab_params='';
var open_dd_valids='';
var open_dd_start=true;
var fav_reload=false;
var player_range_value = [0, 12];
var player_range_start = 0;
var player_range_end = 96;
var player_load_progress = 10;
var player_range_radar_forecast_offset = 0;
var allowed_str_areas=['banner','banner2','banner3','banner4','banner5','banner6','banner7','banner8','topmobile','topmobile2','topmobile3','topmobile4','topmobile5','topmobile6','topmobile7','rectangle','rectangle2','rectangle3','rectangle4','rectangle5','rectangle6','rectangle7','rectangle8','rectangle9','rectangle10','rectangle11','rectangle12','posterad','out_of_page','interstitial','sky','stickyfooter'];
var doPI = true;
var confirmReportClose = false;

// Append cache-busting parameter to all ajax_pub requests
$.ajaxPrefilter(function(options) {
    if (options.url && options.url.indexOf('/ajax_pub') !== -1) {
        var cb = $('#ajax-pub-cb').attr('data-value') || '1';
        options.data = (options.data ? options.data + '&' : '') + $.param({_cb: cb});
    }
});

var preventDataLayerPushRepeat = 1;

let preventDataLayerPush = (() => {
    let _value;
    return {
        get value() {
            return _value;
        },
        set value(newValue) {
          //  console.trace("change value from", _value, "to", newValue);
            _value = newValue;
        }
    };
})();
preventDataLayerPush.value = 0;

/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida
 * https://github.com/luis-almeida
 */

;(function($) {

  $.fn.unveil = function(threshold, callback) {

    var $w = $(window),
        th = threshold || 0,
        retina = window.devicePixelRatio > 1,
        attrib = retina? "data-src-retina" : "data-src",
        images = this,
        loaded;

    this.one("unveil", function() {
      var source = this.getAttribute(attrib);
      source = source || this.getAttribute("data-src");
      if (source) {
        this.setAttribute("src", source);
        if (typeof callback === "function") callback.call(this);
      }
    });

    function unveil() {
      var inview = images.filter(function() {
        var $e = $(this);
        if ($e.is(":hidden")) return;

        var wt = $w.scrollTop(),
            wb = wt + $w.height(),
            et = $e.offset().top,
            eb = et + $e.height();
        return eb >= wt - th && et <= wb + th;
      });
      loaded = inview.trigger("unveil");
      images = images.not(loaded);
    }
    $w.on("scroll.unveil resize.unveil lookup.unveil", unveil);
    unveil();
    return this;
  };
})(window.jQuery || window.Zepto);

try {
    var pageVerticalPosition = 0;localStorage.getItem('pageVerticalPosition') || 0;
    window.scrollTo(0, pageVerticalPosition);
}
catch (e) {
    console.log(e);
}

    
$(document).ready(function () {
    try {
        var pageVerticalPosition = localStorage.getItem('pageVerticalPosition') || 0;
        window.scrollTo(0, pageVerticalPosition);
        localStorage.removeItem('pageVerticalPosition');
    }
    catch (e) { console.log(e); }

    var tmp = parseInt($('#xclicksvalue').attr('data-value'));
    if (tmp>0) {
        xclicksvalue=tmp;
        chartcounter=tmp;
    }
    
    smartphoneStartupTracks();
    resizeWidgets();
    initPageVisibilityEvents();
    $('.dkpw').each(function() {
        if (!$(this).is(":visible"))  {
            $(this).html('');
        }
    } );

    var infocounter=0;
    $('.stroeertest').each(function() {
        infocounter++;
        if(document.getElementById('gSxn2hs93hjs2hAhDRb')) {
            if (!$(this).hasClass('stroeer-wrong')) {
                $(this).css('background','linear-gradient(to bottom right, #fb74c7, #fbdef0)');
                $(this).css('border','1px dashed #fb23a7');
            }
            $(this).css('padding','5px');
            //$(this).css('height','100%');
            $(this).css('font-size','13px');
            var dsizes = $(this).attr('data-sizes');
            if (!isIE()) {
                dsizes = dsizes.replaceAll(",",", ");
            }
            var heightdef = '';
            if ($(this).parent('div').hasClass('str-ba-parent')) { heightdef='Mindest Höhe des Elternelements 250px.'; }
            if ($(this).parent('div').hasClass('str-tm-parent')) { heightdef='Mindest Höhe des Elternelements 300px.'; }
            $(this).html('<h2 style="margin:0;padding:0">'+$(this).attr('data-type')+'</h2><p style="margin:0;padding:0">Formate: '+dsizes+'<br />DOM-ID: '+$(this).attr('id')+'<br />'+heightdef+'</p>');
        }
        else {
            $(this).css('background-color','#f7284b');
            $(this).css('color','#ffffff');
            $(this).css('height','100%');
            $(this).css('font-size','13px');
            $(this).removeAttr("data-nx-container");
            if (!isGoogle()) {
                $(this).html(adblock_txt);
            }
            else {
                $(this).html(adblock_txt2);
            }
            if (infocounter>=2) {
                return false;
            }
        }
    }); 

    if($('#noadblock-info').attr('data-value') === 'true') {
        $('.strpub, .stroeertest').hide();
    }

    a457c035a6dd2ca7c69(function(ret, triggerCode) {
        var adblocker = 'Unknown';

        if(ret) {
            adblocker = 'Enabled';
            var infocounter=0;
            $('.strpub').each(function() {
                infocounter++;
                $(this).css('background-color','#f7284b');
                $(this).css('color','#ffffff');
                $(this).css('height','100%');
                $(this).css('font-size','13px');
                if (!isGoogle()) {
                    $(this).html(adblock_txt);
                }
                else {
                    $(this).html(adblock_txt2);
                }
                if (infocounter>=2) {
                    return false;
                }
            });
        }
        else {
            adblocker = 'Disabled';
        }


        //console.log({adblocker: adblocker, trigger: triggerCode, isAdblockInfoSite: $('#noadblock-info').attr('data-value') === 'true'});

        var urlpath = get_url_path();
        if (urlpath.length == 0) { urlpath = '/'; }
        if (adblocker === 'Enabled' && $('#stop-redirect').attr('data-value') !== 'true' && $('#noadblock-info').attr('data-value') !== 'true' && !isGoogle()) {
            if(location.href.indexOf('adpreview=true') !== -1)
                location.href = get_url_path()+'/site/adblockuser/'+triggerCode+'/?adpreview=true';
            else
                location.href = get_url_path()+'/site/adblockuser/'+triggerCode+'/';
        }
        else if (adblocker === 'Disabled' && $('#noadblock-info').attr('data-value') === 'true' && !isGoogle()) {
            if(location.href.indexOf('adpreview=true') !== -1)
                location.href = urlpath + '?adpreview=true';
            else
                location.href = urlpath;
        }

    });
    
moment.locale(displayLanguageLowerCase());
var legendDate = $('#legende-date').text();
$('#legende-date').text(moment(legendDate, getTimezoneFormat('date')).format(getTimezoneFormat('date', true)));

    if($('#radar-animation option').length) {
        player_range_value[1] = ($('#radar-animation option').length - 1) / 8;
    }

    if($('#radar-animation option').hasClass('radar-forecast')) {
        var endIndex = $('#radar-animation option.radar-forecast').last().index();
        
        player_range_value = [endIndex + 1 - 12, endIndex + 1 + ($('#radar-animation option').length - 1) / 8];
        player_range_radar_forecast_offset = endIndex;
    }

  setDropDownListener();
//   setZoomListener();
  setClickOverlayListener();
  place_obs();
  setup_sliders();
  resize_video();
  setShareListener();
  showOrHideOpenStreetMapInfo();
  checkHash();
  initSevereWeatherIcon();
  initSatTemp();
  initDatePicker();
  initTracks();
  initFloods();
  rdfcPrognose();
  initModelSwitcher();
  initVarSettings();
  initiOSzoomfix();
  loadingForecasts();
  initOpenDivs();
  lightning_filter(1);
  setModelSelectorListener();
  setKlimaVergleichListener();
  setVhstationListener();
  setPhaenologieListener(true);
  loadFclist();
  $("img").unveil();
  if($('#model-valid').length) preload_chart();

  if ($('#unwetterzentrale').attr('data-location') === 'true' && $('#unwetterzentrale').is(":visible")) {
      gps_locating_uwz();
  }
  
  //Switchen zwischen Favoriten und Navbar in der mobilen Ansicht
    $('.favtoggle').on('click', function() {
        $('#w2-collapse').collapse('hide');
  });
  $('#w2-collapse').on('show.bs.collapse', function () {
      $('.mylocations').popover('hide')
        favtoggle_status = 'hide';
  });

    $('.navbar-collapse').on('shown.bs.collapse', function() {
        $('body').css('overflow', 'hidden');
    });

    $('.navbar-collapse').on('hidden.bs.collapse', function() {
        $('body').css('overflow', 'auto');
    });

 

    $('.favtoggle').on('click', function() {
        if (favtoggle_status == 'show') {
            favtoggle_status = 'hide';
        }
        else {
            favtoggle_status = 'show';
            $('#myfavcontent').html(loadingMsg());
            if (checkCookie() === 'cookiefail') {
                 $.get(get_url_path()+'/ajax/mylocationsmobile', {'nocookies':true}, function (data) { $('#myfavcontent').html(data);initiOSzoomfix();activateAutocomplete();},'html');
            }
            else {
                $.get(get_url_path()+'/ajax/mylocationsmobile', {}, function (data) { $('#myfavcontent').html(data);initiOSzoomfix();activateAutocomplete();},'html');
            }
        }
  });
  $('.close-addhistory').on('click', function(){
      addHistory(3);
  });
  $('.settings-close').on('click', function(){
      if (fav_reload === true) {
          location.reload();
      }
      else if ($('#settings-changed').attr('data-value') !== '0') {
          var tld = $('#settings-deftld').attr('data-value');
          $.get(get_url_path()+'/ajax/urlchanger', {
                  'location': location.href,
                  'tld': tld
                    }, function (data) { 
                        if (data == location.href) {
                            location.reload();
                        }
                        else if (data) {
                            location.href = data;
                        }
                    },'html');
          
      }
  });
  
  if (History.Adapter) {
      History.Adapter.bind(window,'statechange',function(){
          var State = History.getState();
          if (State && no_reload == false) {
              location.reload();
          }
          no_reload = false;
      });
      setTimeout(function(){ no_reload = false; }, 1000);

      History.Adapter.bind(window,'popstate',function(e){
        if(typeof e.originalEvent !== 'undefined' && e.originalEvent.type == 'popstate') {

            if(window.location.hash.indexOf('#obs-detail') !== -1) {
                var id = window.location.hash.substring('#obs-detail-'.length);
                var param = null;

                if(id.indexOf(',') !== -1) {
                    var parts = id.split(',');
                    id = parts[0];
                    param = parts[1];
                }
            
                if(typeof id !== 'undefined' && id != '') {
                    var link = get
            
                    if(param !== null)
                        link.attr('data-param', param);
                    else
                        link.removeAttr('data-param');
            
                    if(link.length != 0) {
                        setTimeout(function() {
                            if($('#obs-detail-3h').is(':visible')) {
                                link.attr('data-toggle' , '');
                            }

                            link.trigger('click');
                            link.removeAttr('data-param');
                            link.attr('data-toggle' , 'modal');
                        }, 200);
                        
                    }
                }
            } else {
                var obsId = $('#obs-detail').attr('data-station-id');
                var obs3hId = $('#obs-detail-3h').attr('data-station-id');

                if(typeof obsId !== 'undefined' && obsId != '') {
                    $('#obs-detail').modal('hide');
                }

                if(typeof obs3hId !== 'undefined' && obs3hId != '') {
                    $('#obs-detail-3h').modal('hide');
                }
            }

        }
    });
  }

    $(window).resize(function() {
            resizeWidgets();
            place_obs();
            resize_video();

            Highcharts.charts.forEach(function(v,a,ar) {
                if(typeof v !== 'undefined')
                    v.reflow();
            });

            //TODO: Check iOS orientation change. Sometimes bugs out and will not reflow the OBS-Chart
            // var width = $('#hc_obs_graph').width();
            // $('#debug-width').remove();
            // $('#hc_obs_graph').after('<p id="debug-width">' + width + '</p>');
    });

    if (displayCountry() !== 'de' && displayCountry() !== 'vh' && displayCountry() !== 'vw' && !$('body').hasClass('wide')) {
        $(window).on('scroll', function() {
            var y=window.pageYOffset-$('#top-wrapper').offset().top+110;  	// 110px upper sticky boundary (top-wrapper offset to detect possible advert)
            if(y<35)y=35; 												    // lower limit for top margin in non sticky case
            if(y>$('#top-wrapper')[0].clientHeight-$('.kw-ad-right')[0].clientHeight)
               y=$('#top-wrapper')[0].clientHeight-$('.kw-ad-right')[0].clientHeight; // upper limit for top-margin (aligned to top-wrapper)
            $('.kw-ad-right')[0].style.marginTop=y+"px";
        });
    }
  

  var server_response = $('#server-response').attr("data-value");
  if (server_response === 'unavailable') {
      messageLayer(503,'#error-msg','#error-modal');
  }
  else if (server_response === 'nologin') {
      messageLayer(513,'#error-msg','#error-modal');
  }
  else {
        var blitz = $('#blitz-id-start').attr("data");
        if (blitz) {
            $('#blitzortung').modal('show');
            showLgt(blitz,false);
        }
        var wblitz = $('#weltblitz-id-start').attr("data");
        if (wblitz) {
            $('#blitzortung').modal('show');
            showWLgt(wblitz,false);
        }

        var track_url = $('#track-url-start').attr("data");
        if (track_url) {
            $('#stormtracking').modal('show');
            showTrackDetailByURL(track_url, false);
        }

        var flood_url = $('#flood-url-start').attr("data");
        if (flood_url) {
            $('#stormtracking').modal('show');
            showFloodDetailByURL(flood_url, false);
        }


        var pollen = $('#pollen-id-start').attr("data-id");
        if (pollen) {
            station_name = $('#pollen-id-start').attr("data-name");
            $('#pollen_detail').modal('show');
            showPollen(pollen,station_name,false);
        }
  }
  
  $('.tldselect').on('click', function(e){
      e.preventDefault();
      $.get(get_url_path()+'/ajax/cookieset', {
                    'element_id': 'cs-tld',
                    'id' : $(this).attr('data-select')
                      }, function(data) {
                          if (data) {
                              document.location.href = data;
                          }
                      });
  });
  
  if ($('#register-form-country').html()) {
      $('#register-form-hider').hide();
      $('#register-form-hider2').hide();
      $('#register-form-shower').show();
  }
  graphTabOnClick();
  plotGraph();
  plotGraphCompact();
  if(typeof ensemble_load != 'undefined') {
  	loadGraphEnsembleLong();
    } else {
  	plotGraphEnsembleLong();
    }
  $('[data-toggle="offcanvas"]').on('click', function () {
    $('.row-offcanvas').toggleClass('active')
  });
  

    hoverPopover();
    $('*[data-pocontent]').on('click', function() {
        var e=$(this);
        if (popover_status[$(this).data('pocontent')] == 'show') {
            e.popover('hide');
        }

        else {
            if (e.data('pocontent') == 'mylocations') {
                $('#w2-collapse').collapse('hide');
            }
            var poparams = {};
            if (checkCookie() == 'cookiefail' && e.data('pocontent') == 'mylocations') {
                poparams = {'nocookies':true};
            }
            if ($(this).data('route') != 'undefined') {
                Object.assign(poparams, {'route': $(this).data('route')});
            }
            e.popover({ 'html': true,
                        'placement': 'bottom',
                        'trigger':'manual', 
                        'content': '<div id="poajax_'+e.data('pocontent')+'" style="min-width:246px;">'+loadingMsg()+'</div>',
                        'template': '<div class="popover '+e.data('pocontent')+'" role="tooltip"><div class="arrow"></div><div class="popover-otitle"><a class="pointer poclose" onclick="popoverClose(\''+e.data('pocontent')+'\');"><span class="popover-otclose">&times;<span></a><h3 class="popover-title"></h3></div><div class="popover-content"></div></div>'
                    }).popover('show');
            $.get(get_url_path()+'/ajax/'+e.data('pocontent'),poparams, function(d) {
                $('#poajax_'+e.data('pocontent')).html(d);
                activateAutocomplete();
            },'html');
        }
    });
    
    $('*[data-pocontent]').on('show.bs.popover', function() {
        popover_status[$(this).data('pocontent')] = 'show';
    });
    
    $('*[data-pocontent]').on('hide.bs.popover', function() {
        popover_status[$(this).data('pocontent')] = 'hide';
    });
    
    $('[data-toggle="tooltip"]').tooltip();
    
    
    $('#kachelmann-faq h5>a').on("click", function(e){
      var url = $(this).attr('href');
      setTimeout(function(){$('#kachelmann-faq .in').removeClass('in');},300);
        if($(this).attr('data-faq') && $(this).attr('data-target')) {
            var obj = $($(this).attr('data-target')+'>div');
            if (obj.html() === '...') {
                obj.html('Wird geladen!');
                $.get(get_url_path()+'/ajax/faqs', {
                  'faqid': $(this).attr('data-faq')
                    }, function (data) { 
                        obj.html(data);
                        if (url) {
                          pushHistory(url);
                       }
                    },'html');
           }
        }
        e.preventDefault();
    });
    
    $('.source-marker').on("click", function(e){
       $('#'+$(this).attr('data-id')).select();//.select();
       e.preventDefault();
    });

    $('#forecast-form-0').on('submit', function(e) {
       e.preventDefault();
       forecast_search0();
    });

    $('#forecast-form-1').on('submit', function(e) {
       e.preventDefault();
       forecast_search1();
    });
    
    var opener = $('#faqlayeropener').attr('data-value');
    if (opener !== 'undefined' && opener) {
        $('#faq-modal').modal('show');
    }
    
    activateAutocomplete();
    
    if(navigator.share && typeof navigator.share === 'function') {
        $('.modal .modal-header .btn-navigator-share').show();
    }
}).on("keydown", function(e) {
    dataLayerSource = 'keyboard';
    var model_val = $('#model').val();
    if (typeof model_val !== 'undefined') {
      if(keydown==0){
        keydown=1;
        if ((e.which || e.keyCode) == 116) refresh(e);
        var model = $('#model-flag').val()

        if (model && !isReanalyseModel(model_val) && !isAnalyseModel(model_val)) {    // support cursor keys (reversed direction in model section)
          if ((e.which || e.keyCode) == 39) model_hour_prev();
          if ((e.which || e.keyCode) == 37) model_hour_next();
          if ((e.which || e.keyCode) == 40) model_member_next(e);
          if ((e.which || e.keyCode) == 38) model_member_prev(e);
        }
        else{
          if ((e.which || e.keyCode) == 37) model_hour_prev();
          if ((e.which || e.keyCode) == 39) model_hour_next();
        }
      }
    }
    if(((e.which || e.keyCode) == 39 || (e.which || e.keyCode) == 37) && $('#weather-fccompact-page').length >=1) {

        var availableModels = $('.mod-fc-essentials');
        var currentSelectedIndex = availableModels.index(availableModels.filter('.btn-active'));

        if(currentSelectedIndex === -1) return;

        var nextSelectedIndex = currentSelectedIndex;

        if ((e.which || e.keyCode) == 39) nextSelectedIndex++;
        if ((e.which || e.keyCode) == 37) nextSelectedIndex--;

        if(nextSelectedIndex >= availableModels.length)
            nextSelectedIndex = 0;

        if(nextSelectedIndex < 0)
            nextSelectedIndex = availableModels.length - 1;

        availableModels.get(nextSelectedIndex).click();
    }
  });
$(document).on("keyup", function(e){keydown=0;});


var forecast_search0 = function () {
    if (forecast_search_setting(0)) {
        $('#forecast-form-0').off('submit');
        $('#forecast-form-0').submit();
    }
};
var wetter_search0 = function () {
    $('#forecast-form-0').submit();
};
var forecast_search_setting = function(id) {
    var tab = $('#tab-url').attr("data-src");
    if (typeof tab !== 'undefined') {
        $('#forecast-tab-'+id).val(tab);
    }
    var model = $('#forecast-model').val();
    var action = $('#forecast-action-'+id).val();
    if (typeof action !== 'undefined' && action) { 
        var tmp = action.split('#');
        if (typeof model !== 'undefined' && model) {
            $('#forecast-action-'+id).val(tmp[0].replace("kompakt1x1","kompakt")+'#'+model);
        }
    }
    /*else {
        $('#forecast-action-'+id).val(tmp[0]);
    }*/
    return true;
};
var forecast_search1 = function () {
    if (forecast_search_setting(1)) {
        $('#forecast-form-1').off('submit');
        $('#forecast-form-1').submit();
    }
};
var wetter_search1 = function () {
    $('#forecast-form-1').submit();
};
var forecast_search_nav = function () {
    $('#forecast-form-nav').submit();
};
var forecast_search_fav = function () {
    $('#forecast-form-fav').submit();
};

var setShareListener = function() {
  $('.mouse-overlay').hide();
  $('#content-image').hover(
          function(){
              $('.mouse-overlay').show();
          },
          function(){
              $('.mouse-overlay').hide();
          }
    );
};
var setModelSelectorListener = function() {
    var fl_changed = false;
    $('.mod-fc').off('click').
        on('click', function(e) {
            if ($('#weather-fcxl-page').attr('data-mos-id') !== '') { fl_changed = true; }
            $('#forecast-model').val($(this).attr('data-value'));
            $('#weather-fcxl-page').attr('data-m',$(this).attr('data-value'));
            $('#weather-fcxl-page').attr('data-mos-id','');
            e.preventDefault();
            forecastModel(fl_changed);
        });
    $('.mos-fc').off('click').
        on('click', function(e) {
            if ($('#weather-fcxl-page').attr('data-mos-id') !== $(this).attr('data-value')) { fl_changed = true; }
            $('#weather-fcxl-page').attr('data-mos-id',$(this).attr('data-value'));
            e.preventDefault();
            forecastModel(fl_changed);
        });
    $('.mod-fc-trend').off('click').
        on('click', function(e) {
            if ($('#weather-fcxl-page').attr('data-mos-id') !== '') { fl_changed = true; }
            $('#forecast-model').val($(this).attr('data-value'));
            $('#weather-fcxl-page').attr('data-m',$(this).attr('data-value'));
            $('#weather-fcxl-page').attr('data-mos-id','');
            e.preventDefault();
            forecastModelTrend(fl_changed);
        });    
    $('.mos-fc-trend').off('click').
        on('click', function(e) {
            if ($('#weather-fcxl-page').attr('data-mos-id') !== $(this).attr('data-value')) { fl_changed = true; }
            $('#weather-fcxl-page').attr('data-mos-id',$(this).attr('data-value'));
            e.preventDefault();
            forecastModelTrend(fl_changed);
        });
    $('.mod-fc-switch').off('click').
        on('click', function(e) {
            e.preventDefault();
            switchForecast($(this).attr('data-out'));
        });
    /*$('.mod-fc-essentials').off('click').
        on('click', function(e) {
            e.preventDefault();
            $('#forecast-model').val($(this).attr('data-value'));
            forecastModelEssentials();
        });*/
    $('.mod-fc-ensemble').off('click').
        on('click', function(e) {
            e.preventDefault();
            $('#forecast-model').val($(this).attr('data-value'));
            forecastModelEnsemble();
        });
    $('.mod-fc-ensemble-view').off('click').
        on('click', function(e) {
            e.preventDefault();
            $('#forecast-view-selector').attr('data-value',$(this).attr('data-value'));
            forecastModelEnsemble();
        });
    $('.mod-fc-ensemble-sort').off('click').
        on('click', function(e) {
            e.preventDefault();
            $('#forecast-sort-selector').attr('data-value',$(this).attr('data-value'));
            $('.mod-fc-ensemble-sort').removeClass('btn-active');
            $(this).addClass('btn-active');

            sortEnsembleHeatmapData();

            var category_count = (hc_sorted_heat_cat.length - 1);
            var max_category_count = 53;
            var step = Math.ceil(category_count / max_category_count);
    

            $('#ensemble_graph').highcharts().update({
                chart: {
                    height: Math.ceil((category_count / step) * 8 + 200)
                },
                yAxis: {
                    title: 'false',
                    type: 'category',
                    categories: hc_sorted_heat_cat,
                    reversed: true,
                    floor: 0,
                    ceiling: hc_sorted_heat_cat.length - 1,
                    labels: {
                        step: step,
                        style: {
                            fontSize: '9px'
                        }
                    }
                },
                series: hc_sorted_heat_data
            });

            showSortRangeSlider();
            forecastModelEnsemble(1);

        });
    $('#ensemble-vorhersage #forecast-ensemble-parameters a.graphtab').off('click').
        on('click', function(e) {
            e.preventDefault();
            $('#tab-url').attr('data-src',$(this).attr('data-value'));
            forecastModelEnsemble();
        });

};

var zoomEvent = function(ev) {
    var e = ev.srcEvent;
    model_player_stop();
    images=[];       // clear buffers for preloading loop images
    loaded_image_sources=[];
    images_loaded=0; // reset loader
    loading=0;
    images_extend=1;
    //closeMarker();

    var bounds = $('#click-overlay').get(0).getBoundingClientRect();
    var left = bounds.left;
    var top = bounds.top;
    var factor = 760 / parseInt(getImageWidth());

    var posX = (ev.center.x - left) * factor;
    var posY = (ev.center.y - top) * factor;

    //console.log({posX, posY, bounds, factor, ev});

    if(posX < 0 || posY < 0 || posX > bounds.width * factor || posY > bounds.height * factor) {
        if(typeof e.clientX !== 'undefined' && typeof e.clientY !== 'undefined') {
            posX = (e.clientX - left) * factor;
            posY = (e.clientY - top) * factor;
        } else {
            posX = (e.pageX - window.pageXOffset - left) * factor;
            posY = (e.pageY - window.pageYOffset - top) * factor;
        }
    }

   // console.log({posX, posY, bounds, usingClientProps: typeof e.clientX !== 'undefined' && typeof e.clientY !== 'undefined', e, ev});

    var params = {
        'posX' : posX,
        'posY' : posY,
        'area_id' : get_selected_area(),
        'area_hierarchy' : get_area_hierarchy(),
        'model' : $('#model').val(),
        'model_valid' : $('#model-valid').val(),
        'model_run' : $('#model-run').val(),
        'model_param' : $('#model-param').val(),
        'model_source' : $('#model-source').val() || $('#area-source').val(),
        'model_location' : $('#model-location').val(),
        'model_member' : $('#model-member').val(),
        'geo_lat' : $('#geo-lat').val(),
        'geo_long' : $('#geo-long').val(),
        'fl_newest' : $('#newest-flag').val(),
        'fl_param' : $('#param-flag').val(),
        'fl_model' : $('#model-flag').val(),

        };
    if ($('#model').val() === 'blitze' || $('#model').val() === 'weltblitze') {
        if($('#blitze-5minonly').prop('checked')) {
            params.blitze_5minonly = 'true';
        }
        if ($('#model').val() === 'blitze') {
            params.blitz_filter = lightning_filter_value;
        }

    }

    if ($('#model').val() === 'sat') {
        if($('#sat-blitz-overlay-enabled').prop('checked')) {
            params.blitz_overlay_enabled = 'true';
        }
    }

    if ($('#model').val() === 'cyclone') {
        params.model_filter_storm = $('#model-filter-storm').val();
    }
    //$('.lp_param').html($('.container').width()+' left: '+$('#content-image').position().left+' top:'+$('#content-image').position().top+' factor: '+factor+' posX:'+Math.round((e.pageX-($('#content-image').position().left+get_abstand())-left)*factor)+ ' posY:'+Math.round((e.pageY-($('#content-image').position().top)-top)*factor));
    ajaxLoaderShowDelay();
    $.post(get_url_path()+'/ajax/zoomall', params, function (data) {
            ajaxLoaderHide();
            if (data === 'SURVIVAL') {
                messageLayer(101,'#error-msg','#error-modal');
            }
            else if (data === 'NOT_ALLOWED') {
                messageLayer(403,'#error-msg','#error-modal');
            }
            else if (data === 'UNAVAILABLE') {
                messageLayer(503,'#error-msg','#error-modal');
            }
            else if (data === 'PAYWALL_FEATURE') {
                showExtraNotice();
            }
            else if (data === 'TOO_MANY_REQUESTS') {
                messageLayer(429,'#error-msg','#error-modal');
            }
            else if (data !== 'FALSE') {
                if (data === 'not_allowed') {
                    messageLayer(102,'#error-msg','#error-modal');
                }
                else {
                    destroy_sliders();
                    $('#drop-downs').html(data);
                    setDropDownListener();
                    changeImage();
                    showOrHideOpenStreetMapInfo();
                    place_obs();
                    setup_sliders();
                    setClickOverlayListener();
                    reloadIframeAds();
                    initDatePicker();
                    initOpenDivs();
                }
            }
            },'html');
};

$(document).on('mousemove','#main-image-content:not(.slider-ui) #click-overlay',function(event){
    if (($('#acc-layer-areas .switch-map.map-grid')).length != 0 && $('#acc-layer-areas .switch-map.map-grid').parent('li').hasClass('active')) {
        var bounds = $('#click-overlay').get(0).getBoundingClientRect();
        var left = bounds.left;
        var top = bounds.top;
        var factor = 760 / parseInt(getImageWidth());
        if(typeof event.clientX !== 'undefined' && typeof event.clientY !== 'undefined') {
            mousePosX = (event.clientX - left) * factor;
            mousePosY = (event.clientY - top) * factor;
        } else {
            mousePosX = (event.pageX - window.pageXOffset - left) * factor;
            mousePosY = (event.pageY - window.pageYOffset - top) * factor;
        }
        if(mousePosY < 50 || mousePosY > 560 || mousePosX < 60 || mousePosX > 700) {
            break_Y_left = 190;
            break_Y_right = 570;
            break_X_top = 154;
            break_X_bottom = 462;

            if (mousePosY < 50) {
                if (mousePosX > 0 && mousePosX < break_Y_left) {
                    $('#click-overlay').css('cursor', 'nw-resize');
                } else if (mousePosX > break_Y_right && mousePosX < 760) {
                    $('#click-overlay').css('cursor', 'ne-resize');
                } else {
                    $('#click-overlay').css('cursor', 'n-resize');
                }
            }
            if (mousePosY > 560) {
                if (mousePosX > 0 && mousePosX < break_Y_left) {
                    $('#click-overlay').css('cursor', 'sw-resize');
                } else if (mousePosX > break_Y_right && mousePosX < 760) {
                    $('#click-overlay').css('cursor', 'se-resize');
                } else {
                    $('#click-overlay').css('cursor', 's-resize');
                }

            }
            if (mousePosX < 60) {
                if (mousePosY > 0 && mousePosY < break_X_top) {
                    $('#click-overlay').css('cursor', 'nw-resize');
                } else if (mousePosY > break_X_bottom && mousePosY < 620) {
                    $('#click-overlay').css('cursor', 'sw-resize');
                } else {
                    $('#click-overlay').css('cursor', 'w-resize');
                }

            }
            if (mousePosX > 700) {
                if (mousePosY > 0 && mousePosY < 120) {
                    $('#click-overlay').css('cursor', 'ne-resize');
                } else if (mousePosY > 460 && mousePosY < 620) {
                    $('#click-overlay').css('cursor', 'se-resize');
                } else {
                    $('#click-overlay').css('cursor', 'e-resize');
                }
            }
        } else {
            $('#click-overlay').css('cursor', 'zoom-in');
        }
    }
});

var inputOverlayHammer = null;
var image_slider_array = [];
var setClickOverlayListener = function() {
    stopSliderUI(true);
    if(inputOverlayHammer) inputOverlayHammer.destroy();

    $('#scale-overlay .image-slider, #scale-overlay .slider-beta').remove();

    //Wird überschrieben, wenn Slider freigeschaltet
    window.refreshSliderElements = function() {};

    if($('#click-overlay').length == 0) return;
    $('#click-overlay').attr('draggable', 'false');
    $('#click-overlay').off('contextmenu').on('contextmenu', false);
    $('#click-overlay').off('dragstart').on('dragstart', false);
    if ($('#click-overlay').hasClass('clim-progsound-on') || $('#click-overlay').hasClass('clim-trajectory-on')) return;


    var radar = $('#radar-animation').length > 0;
    var isRadarModelchartsMix = $('#model').val() == 'modera5'; //Animation wie Radar, aber mit Intervallauswahl

    var clickOverlayEl = $('#click-overlay').get(0);
    inputOverlayHammer = new Hammer.Manager(clickOverlayEl, { touchAction: 'manipulation' });

    var tapRecog = new Hammer.Tap();
    inputOverlayHammer.add(tapRecog);
    inputOverlayHammer.on('tap', zoomEvent);

    var swipeRecog = new Hammer.Swipe({direction: Hammer.DIRECTION_HORIZONTAL});
    inputOverlayHammer.add(swipeRecog);
    inputOverlayHammer.on('swipe', function(ev) {

        if(ev.direction == Hammer.DIRECTION_LEFT) {
            console.log('DIRECTION_LEFT');
            $('#drop-downs .hour-next').click();
        } else if(ev.direction == Hammer.DIRECTION_RIGHT) {
            console.log('DIRECTION_RIGHT');
            $('#drop-downs .hour-prev').click();
        }
    })


    if($('#image-slider-flag').length == 0 || !$('#image-slider-flag').attr('data-value')) return;
    if($('#radar-animation').length == 0 && $('#model-player-interval').length == 0) return;

    var radar = $('#radar-animation').length > 0;
    var player_item_domid = radar ? '#radar-animation' : '#modelcharts-animation-1';

    if(isRadarModelchartsMix) player_item_domid = '#modelcharts-animation-' + $('#model-player-interval').val();

    $('<span class="slider-beta">BETA</span><div class="image-slider out"></div>').insertAfter($('#click-overlay'));
    
    var imageSlider = $('#scale-overlay .image-slider');
    var mainImageContent = $('#main-image-content');
    var clickOverlay = $('#click-overlay');
    var animationSelect = $(player_item_domid);

    var refreshSliderElements = function() {

        if($('#radar-animation').length == 0 && $('#model-player-interval').length == 0) return;
    
        var radar = $('#radar-animation').length > 0;
        var isRadarModelchartsMix = $('#model').val() == 'modera5'; //Animation wie Radar, aber mit Intervallauswahl
        var player_item_domid = radar ? '#radar-animation' : '#modelcharts-animation-1';
        if($('#modelcharts-animation-15min').length) player_item_domid = '#modelcharts-animation-15min';
        if(isRadarModelchartsMix) player_item_domid = '#modelcharts-animation-' + $('#model-player-interval').val();

        animationSelect = $(player_item_domid);
    
        var oldActiveSlideUrl = $('#scale-overlay .image-slider').find('.slide-element.active').attr('data-img-url');

        var slideElements = '';
        image_slider_array = [];
        $('#scale-overlay .image-slider').empty();

        var selected_model_valid = $('#model-valid').val();

        $(player_item_domid + ' option').each(function() {
            var optEl = $(this);
            var index = optEl.index();
            
            var model_valid = optEl.val();
            var forecast_min = null;
            if(optEl.hasClass('radar-forecast')) {
                forecast_min = optEl.attr('data-fcminute');
                var run_ts = optEl.attr('data-run');
                model_valid = moment.unix(run_ts).tz('UTC').format('YYYY-MM-DD/HH:mm') + '#' + moment.unix(run_ts).format('YYYY-MM-DD/HH:mm')
            }
            var image = get_model_image_path(null, null, null, model_valid, null, forecast_min);
    
            if(image) {
                image_slider_array[index] = image;
    
                if(radar || isRadarModelchartsMix) {
                    if(optEl.hasClass('radar-forecast')) {
                        slideElements = '<div class="slide-element radar-forecast" data-index="' + index + '" data-img-url="' + image + '"></div>' + slideElements;
                    } else {
                        slideElements = '<div class="slide-element" data-index="' + index + '" data-img-url="' + image + '"></div>' + slideElements;
                    }
                }
                else {
                    var model_valid_parts = model_valid.split('#');
                    var momentDate = moment.utc(model_valid_parts[0], 'YYYYMMDDHH');
                    if(model_valid_parts[1].indexOf('-')) {
                        var hour_minutes = model_valid_parts[1].split('-');
                        var hour = +hour_minutes[0];
                        var minutes = +hour_minutes[1];
                        momentDate.add(hour, 'hours');
                        momentDate.add(minutes, 'minutes');
                    } else {
                        momentDate.add(model_valid_parts[1], 'hours');
                    }

                    // console.log([momentDate.tz('UTC').format('YYYY-MM-DD/HH:mm'), selected_model_valid]);

                    if(momentDate.tz('UTC').format('YYYY-MM-DD/HH:mm') == selected_model_valid)
                        slideElements = slideElements + '<div class="slide-element" id="selected-model-valid" data-index="' + index + '" data-img-url="' + image + '"></div>';
                    else
                        slideElements = slideElements + '<div class="slide-element" data-index="' + index + '" data-img-url="' + image + '"></div>';

                }
            }
        });
        $('#scale-overlay .image-slider').append(slideElements);
    
        if($('#main-image-content').hasClass('slider-ui')) {
            startSliderUI(true);

            $('#scale-overlay .image-slider').find('.slide-element.active').removeClass('active');
            $('#scale-overlay .image-slider').find('.slide-element[data-img-url="'+oldActiveSlideUrl+'"]').addClass('active instant');
        }
    }

    window.refreshSliderElements = refreshSliderElements;
    refreshSliderElements();

    var pressThresholdMs = 501;

    var pressRecog = new Hammer.Press({time: pressThresholdMs, threshold: 150});
    var pressUpRecog = new Hammer.Press({event: 'pressup', time: 1, threshold: 150});
    var panRecog = new Hammer.Pan({enable: false, threshold: 2, direction: Hammer.DIRECTION_HORIZONTAL});
    
    inputOverlayHammer.add(pressRecog);
    inputOverlayHammer.add(pressUpRecog);
    inputOverlayHammer.add(panRecog);
    swipeRecog.recognizeWith(panRecog);

    var stopSliderHandle = null;

    inputOverlayHammer.on('press pressup', function(ev) {
        //console.log(ev);
        if(ev.type == 'press' && !mainImageContent.hasClass('slider-ui')) {
            console.log('START_SLIDER_UI');
            inputOverlayHammer.set({touchAction: 'compute'});
            pressRecog.set({time: 1});
            panRecog.set({enable: true});
            tapRecog.set({enable: false});
            swipeRecog.set({enable: false});
            clickOverlayRect = null;
            startSliderUI();
            animationSelect.prop('selectedIndex', 0);
            setSliderPercActive(imageSlider.find('.slide-element.active').index());
            moveImageSlider(ev);
        }
        if(ev.type == 'pressup' && ev.eventType == Hammer.INPUT_END && mainImageContent.hasClass('slider-ui')) {
            console.log('PAUSE_SLIDER_UI');
            setSliderPercActive(imageSlider.find('.slide-element.active').index());
            inputOverlayHammer.set({touchAction: 'manipulation'});
            stopSliderHandle = setTimeout(function() {
                console.log('STOP_SLIDER_UI');
                stopSliderHandle = null;
                stopSliderUI();
                if(panRecog.manager.element != null) {
                    pressRecog.set({time: pressThresholdMs});
                    panRecog.set({enable: false});
                    tapRecog.set({enable: true});
                    swipeRecog.set({enable: true});
                }
            }, 2000);
        } else if(ev.type == 'pressup' && ev.eventType == Hammer.INPUT_START && stopSliderHandle != null) {
            console.log('RESUME_SLIDER_UI');
            inputOverlayHammer.set({touchAction: 'compute'});
            clearTimeout(stopSliderHandle);
            stopSliderHandle = null;
            clickOverlayRect = null;
            setSliderPercActive(imageSlider.find('.slide-element.active').index());
            moveImageSlider(ev);
        }
    });
    inputOverlayHammer.on('pan', function(ev) {
        //console.log(ev);
        if(!mainImageContent.hasClass('slider-ui')) return;
        if(ev.eventType == Hammer.INPUT_END) {
            console.log('PAUSE_SLIDER_UI');
            setSliderPercActive(imageSlider.find('.slide-element.active').index());
            inputOverlayHammer.set({touchAction: 'manipulation'});
            clickOverlay.css('cursor', 'grab');
            stopSliderHandle = setTimeout(function() {
                console.log('STOP_SLIDER_UI');
                stopSliderHandle = null;
                stopSliderUI();
                if(panRecog.manager.element != null) {
                    pressRecog.set({time: pressThresholdMs});
                    panRecog.set({enable: false});
                    tapRecog.set({enable: true});
                    swipeRecog.set({enable: true});
                }
            }, 2000);
        } else if(ev.eventType == Hammer.INPUT_MOVE || ev.eventType == Hammer.INPUT_START) {
            clickOverlay.css('cursor', 'grabbing');
            clearTimeout(stopSliderHandle);
            stopSliderHandle = null;
            if(ev.eventType == Hammer.INPUT_START) {
                setSliderPercActive(imageSlider.find('.slide-element.active').index());
            }
            moveImageSlider(ev);
        }
    });

    var clickOverlayRect = null;
    var getSlideIndexFromEvent = function(event) {
    
        if(clickOverlayRect == null)
            clickOverlayRect = clickOverlay.get(0).getBoundingClientRect();
    
        var leftOffset = 0;

        if(typeof event.srcEvent.clientX !== 'undefined')
            leftOffset = event.srcEvent.clientX - clickOverlayRect.left;
        else
            leftOffset = event.srcEvent.pageX - window.pageXOffset - clickOverlayRect.left;

        var percPointerX = leftOffset / clickOverlayRect.width;
    
        var percInitial = (leftOffset - event.deltaX) / clickOverlayRect.width;
        var start_active_offset = slider_perc_active == null ? percPointerX : slider_perc_active;
        
        var percOffset = start_active_offset - (percInitial - percPointerX);
        percOffset = percOffset > 1 ? 1 : (percOffset < 0 ? 0 : percOffset);
        
        //console.log({leftOffset, percPointerX, percInitial, percOffset});
    
        var slideElementsCount = imageSlider.find('.slide-element').length;
        
        var slideIndex = Math.floor((percOffset * slideElementsCount));
        slideIndex = Math.min(slideIndex, slideElementsCount - 1);
    
        return slideIndex;
    }
    
    var moveImageSlider = function(event) {
        if(!mainImageContent.hasClass('slider-ui')) return;
    
        var slideIndex = getSlideIndexFromEvent(event);
        //console.log({x: leftOffset, perc: percPointerX, slideIndex: slideIndex});
    
        var slideElements = imageSlider.find('.slide-element');
        var activeSlide = slideElements.eq(slideIndex);
    
        if(activeSlide.hasClass('loaded')) {
            slideElements.removeClass('active');
            activeSlide.addClass('instant active');
    
            var optionsIndex = activeSlide.data('index');
            
            if(animationSelect.prop('selectedIndex') != optionsIndex) {
                animationSelect.prop('selectedIndex', optionsIndex);
                replacePlayerImage('#' + animationSelect.attr('id'), true);
            }
        }
    }

}


var slider_perc_active = null;
var setSliderPercActive = function(panStartIndex) {
    if(panStartIndex == null) slider_perc_active = null;
    else {
        slider_perc_active = panStartIndex / ($('#scale-overlay .image-slider').find('.slide-element').length - 1);
    }
}

var startSliderUI = function(just_update) {

    if(is_preloading || is_playing) model_player_stop();

    if(isReanalyseModel($('#model').val()) && typeof refreshSliderElements === 'function') refreshSliderElements();

    $('#main-image-content').addClass('slider-ui');
    $('#click-overlay').css('cursor', 'grabbing');

    var imageSlider = $('#scale-overlay .image-slider');

    imageSlider.find('.slide-element').removeClass('preloading loaded active instant');
    imageSlider.find('.slide-element').each(function() {
        var el = $(this);
        var url = el.attr('data-img-url');
        if($('#preload-cache-container img.preload-cache-image[src="'+url+'"]').length) {
            el.addClass('instant loaded');
        }
    });

    imageSlider.removeClass('out');

    var startSlide = imageSlider.find('.slide-element#selected-model-valid');
    if(startSlide.length == 0) startSlide = imageSlider.find('.slide-element[data-index=0]');

    if(imageSlider.find('.slide-element.radar-forecast').length > 0) {
        startSlideIndex = +imageSlider.find('.slide-element.radar-forecast').first().attr('data-index') + 1;
        startSlide = imageSlider.find('.slide-element[data-index='+startSlideIndex+']');
    }

    if(isAnalyseModel($('#model').val())) {
        var animation_val = $('#radar-animation').find('option').eq(player_range_value[0]).val();
        var model_valid = $('#model-valid').val();

        if(animation_val.indexOf(model_valid) === -1) {
            var selected_animation_index = $('#radar-animation option[value^="'+$('#model-valid').val()+'"]').index();
            startSlide = imageSlider.find('.slide-element[data-index='+selected_animation_index+']');
        }
    }
    var start_index = parseInt(startSlide.attr('data-index'));
    startSlide.addClass('loaded active instant');    

    if(image_slider_array) {
        var progress = function(index, numFinished, mode) {
            var el = imageSlider.find('.slide-element[data-index="'+index+'"]');
            if(mode == 1)
                el.addClass('preloading');
            else if(mode == 2)
                el.removeClass('preloading').addClass('loaded');
        };

        var finished = function(errorOccured) {

        };

        preload_image_array(image_slider_array, start_index, progress, finished);

    }
};

var stopSliderUI = function(no_image_change) {

    stop_preload_image_array();

    $('#main-image-content').removeClass('slider-ui');
    $('#click-overlay').css('cursor', '');

    var imageSlider = $('#scale-overlay .image-slider');
    imageSlider.addClass('out');
    //imageSlider.find('.slide-element').removeClass('preloading loaded');

    clickOverlayRect = null;
    setSliderPercActive(null);

    if(!no_image_change && !(is_preloading || is_playing))
        changeImage(true);
};

var getImageWidth = function() {
    return $('#click-overlay').width();
}
var zoom_out = function() {
    model_player_stop();
    images=[]; // buffers for preloading loop images
    loaded_image_sources=[];
    images_loaded=0;
    loading=0;
    var areas = getAreaArray();
    ajaxLoaderShowDelay();
    $.post(get_url_path()+'/ajax/zoomout', {
        'area_id' : get_selected_area(),
        'areas_1' : areas[1],
        'areas_2' : areas[2],
        'areas_3' : areas[3],
        'areas_4' : areas[4],
        'areas_5' : areas[5],
        'areas_6' : areas[6],
        'areas_7' : areas[7],
        'areas_8' : areas[8],
        'areas_9' : areas[9],
        'model' : $('#model').val(),
        'model_param' : $('#model-param').val(),
        'model_source' : $('#model-source').val() || $('#area-source').val(),
        'model_location' : $('#model-location').val(),
        'model_valid' : $('#model-valid').val()
        }, function (data) { 
            ajaxLoaderHide();
            if (data === 'not_allowed') {
                messageLayer(103,'#error-msg','#error-modal');
            }
            else if (data === 'NOT_ALLOWED') {
                messageLayer(403,'#error-msg','#error-modal');
            }
            else if (data === 'PAYWALL_FEATURE') {
                showExtraNotice();
            }
            else if (data === 'UNAVAILABLE') {
                messageLayer(503,'#error-msg','#error-modal');
            }
            else if (data === 'TOO_MANY_REQUESTS') {
                messageLayer(429,'#error-msg','#error-modal');
            }
            else {
                findAndSetArea(get_selected_area());
                //closeMarker();
                refreshDropdowns();

            }
           },'html');
};

var findAndSetArea = function(area_id) {
    var fieldname = '';
    var counter = 0;
    for (i=1;i<=9;i++) {
        counter = counter * 1000;
        fieldname = '#form-areaid-'+i;
        $(fieldname+' option').each(function(){
           counter++;
           if (parseInt($(this).attr('value')) === parseInt(area_id) && counter > 1000) {
               $(fieldname).val('0');
               return fieldname;
           }
        });
    }
};


var cookieSettings = function() {
    $('#settings-msg').html(loadingGif());
    $('#settings-modal').modal('show');
    var poparams = {};
    if (checkCookie() == 'cookiefail') {
        poparams = {'nocookies':true};
    }
    $.get(get_url_path()+'/ajax/settings', poparams, function(data) {
        $('#settings-msg').html(data);
        $('#cookie-settings-form select').off('change').
            on('change', function(e) {
                cookiesave($(this).attr('id'));
                e.preventDefault();
            }
        );
        $('#unit-settings-forecast button').off('click').
            on('click', function(e) {
                var parent_div = $(this).parent('.btn-group');
                if (typeof parent_div !== 'undefined') {
                    parent_div.children('button').removeClass('btn-active');
                    $(this).addClass('btn-active');
                    cookiesave(parent_div.attr('id'), $(this).attr('value'));
                }
                e.preventDefault();
            }
        );
        $('#unit-settings-charts button').off('click').
            on('click', function(e) {
                var parent_div = $(this).parent('.btn-group');
                if (typeof parent_div !== 'undefined') {
                    var activecounter = 0;
                    var limit = 1;
                    parent_div.children('button').each(function(){
                        if ($(this).hasClass('btn-active')) {
                            activecounter++;
                            if ($(this).attr('value') === 'bft') {
                                limit=2;
                            }
                        };
                    });
                    if ($(this).hasClass('btn-active') && activecounter>limit || (limit == 2 && $(this).attr('value') === 'bft')) {
                        $(this).removeClass('btn-active');
                    }
                    else {
                        $(this).addClass('btn-active');
                    }
                    var liste = '';
                    parent_div.children('button').each(function(){
                        if ($(this).hasClass('btn-active')) {
                            if (liste.length) {
                                liste=liste+',';
                            }
                            liste=liste+$(this).attr('value');
                        };
                    });
                    cookiesave(parent_div.attr('id'), liste);
                }
                e.preventDefault();
            }
        );
    },'html');
};

var cookiesave = function(element_id, value) {
    if (typeof value === 'undefined') {
        value = $('#'+element_id).val();
    }
    if (typeof value !== 'undefined' && typeof element_id !== 'undefined') {
        $.get(get_url_path()+'/ajax/cookieset', {
                    'element_id': element_id,
                    'id' : value
                      }, function(data) {
                          if (element_id === 'cs-tld') {
                              $('#settings-deftld').attr('data-value',value);
                          }
                        $('#settings-changed').attr('data-value','1');
                      });
    }
    return false;
};

var loadingGif = function() {
    var loadingImageURL = $('#loading-image-url').attr('data-value');
    if (typeof loadingImageURL === 'undefinded' || !loadingImageURL) {
        loadingImageURL = '/images/ajax-loader.gif';
    }
    return '<p style="text-align:center;margin-top:10px;"><img src="'+loadingImageURL+'" alt="Loading" /></p>';
};

var radarus_is_dyn = function(param) {
    if (typeof param === 'undefined') {
        param = $('#model-mode').val();
    }
    return (param === 'RADARUS_DYN' || param === 'RADARUS_DYN_HI' || param === 'RADARUS_DYN_AK' || param === 'RADARUS_DYN_NC');
};

var setDropDownListener = function() {
    $('#drop-downs select').off('change').
            on('change', function() {
                product = $(this).closest('.product-info').data('product');
                //closeMarker();

                if (product == 'model') {
                    if ($(this).attr('id') == 'model-run') {
                        pushToDataLayer({'event':'model_actions','action':'switch_run','source':'select'});
                        pushToDataLayer({'event':'archive','product':'models','year':parseInt($(this).val().slice(0, 4))});
                    }

                    if ($(this).attr('id') == 'model-valid') {
                        if (typeof dataLayerSource !== 'undefined') {
                            pushToDataLayer({'event':'model_actions','action':'switch_termin','source':dataLayerSource});
                        } else {
                            pushToDataLayer({'event':'model_actions','action':'switch_termin','source':'select'});
                        }
                        delete dataLayerSource;
                    }

                    if ($(this).attr('id') == 'model-member') {
                        if (typeof dataLayerSource !== 'undefined') {
                            pushToDataLayer({'event':'model_actions','action':'switch_member','source':dataLayerSource});
                        } else {
                            pushToDataLayer({'event':'model_actions','action':'switch_member','source':'select'});
                        }
                        delete dataLayerSource;
                    }
                } else {
                    if (product != 'undefined' && /^\d{4}$/.test(parseInt($(this).val().slice(0, 4)))) {
                        pushToDataLayer({'event':'archive','product':product,'year':parseInt($(this).val().slice(0, 4))});
                    }

                }


                if ($(this).attr('id') !== 'model-player-interval') {
                    changeImage(true);
                    refreshDropdowns(null, null, null, null, $(this));
                }
            }
    );
    $('#drop-downs select').off('focus').
            on('focus', function() {
                //model_player_stop();
            }
    );
    setElementHiders();
    setAccListener();
    $('.player-forecast-option > a').off('click').on('click', function(e){ 
        e.preventDefault();
        var st=$(this).attr('data-setting');
        if (st === 'off') {
            $.get(get_url_path()+'/ajax/elementhider', {
                        'element_id': 'player-forecast-option'
                          }, function() {
                              refresh(e);
                          });
        }
        else {
            $.get(get_url_path()+'/ajax/elementshower', {
                        'element_id': 'player-forecast-option'
                          }, function() {
                              refresh(e);
                          });
        }
    });
    if($('#modelcharts-animation-15min').length && $('#model-player-interval').val() == 1) $('#model-player-interval').val('15min');
    $('#model-player-interval').data("prev", $('#model-player-interval').val());
    $('#model-player-interval').off('change').on('change', function() {
        var was_playing = is_playing || is_preloading;
        
        if(was_playing) 
            model_player_stop();
        
        destroy_sliders();
        setup_sliders(true);

        if(was_playing)
            modelcharts_player_start();
        

        $('#model-player-interval').data("prev", $('#model-player-interval').val());
    }); 

    $('#blitze-5minonly').off('change').on('change', function(e){e.preventDefault();lightning_filter();});

    $('#sat-blitz-overlay-enabled').off('change').on('change', function(e) {
        e.preventDefault();
        sat_blitz_overlay();
    });

    initAutoRefresh();
};

var closeAccLayer = function (obj) {
    var id = obj.attr('id');
    $('[data-id='+id+']').each(
        function() {
             if ($(this).hasClass('acc-btn-on')) {
                 $(this).addClass('acc-btn-active');
             }
             else {
                 $(this).removeClass('acc-btn-active');
             }
        }
    );
    obj.slideUp();
}
var closeAcc2Layer = function (obj) {
    var id = obj.attr('id');
    $('.acc2-layer').each(
        function() {
             if ($(this).hasClass('acc2-btn-active')) {
                 $(this).removeClass('acc2-btn-active');
             }
        }
    );
    obj.slideUp();
}
var openAccLayer = function (obj) {
    var id = obj.attr('data-id');
    $('[data-id='+id+']').each(
        function() {
             if ($(this).hasClass('acc-btn-on')) {
                 $(this).removeClass('acc-btn-active');
             }
             else {
                 $(this).addClass('acc-btn-active');
             }
        }
    );
    $('#'+id).slideDown();
    scrollTopParam();
}
var openAccLayerDirect = function (obj) {
    var id = obj.attr('data-id');
    $('[data-id='+id+']').each(
        function() {
             if ($(this).hasClass('acc-btn-on')) {
                 $(this).removeClass('acc-btn-active');
             }
             else {
                 $(this).addClass('acc-btn-active');
             }
        }
    );
    $('#'+id).show();
    scrollTopParam();
}

var scrollTopParam = function() {
    var scrolling = $('#ac-id-param').offset();
    var start = $('#param-autoscroll-all').offset();
    if (typeof scrolling !== 'undefined' && typeof start !== 'undefined') {
        //alert(start.top + ' ' + scrolling.top);
        $('#param-autoscroll-all').animate({scrollTop:scrolling.top-start.top}, 0);
    }
    var scrolling = $('#ac-id-location').offset();
    var start = $('#location-autoscroll-all').offset();
    if (typeof scrolling !== 'undefined' && typeof start !== 'undefined') {
        //alert(start.top + ' ' + scrolling.top);
        $('#location-autoscroll-all').animate({scrollTop:scrolling.top-start.top}, 0);
    }
}

var openAcc2Layer = function (obj) {
    var id = obj.attr('data-id');
    var id_params = '#param-autoscroll-all';
    //var id_flex = id.replace('source-param/)
    var previousVisibleLayer = $('.acc2-btn-active').next('.acc2-layer:visible');
    var id_flex = $('#'+id).parent().parent().attr('id');
    if (typeof id_flex !== 'undefined') {
        id_params = id_flex;
    }
    $('.acc2-layer').each(
        function() {
             if ($(this).hasClass('acc2-btn-active')) {
                 $(this).removeClass('acc2-btn-active');
             }
        }
    );
    obj.addClass('acc2-btn-active');
    $('#'+id).slideDown();
    
    //Die angeklickte Kategorie nach oben scrollen, so dass sie nicht außerhalb des sichtbaren Bereichs ist
    var parentContainer = obj.closest('div');
    var offsetTop = parentContainer.offset().top;
    var scrollOffsetTop = $('#'+id_params).offset().top;
    var scrollTop = $('#'+id_params).scrollTop();
    
    var previousHeight = 0;
    if(previousVisibleLayer.length > 0 && previousVisibleLayer.offset().top < offsetTop)
        previousHeight = previousVisibleLayer.height();

    $('#param-autoscroll-all').animate({scrollTop: scrollTop - (scrollOffsetTop - offsetTop) - previousHeight}, 400);

}

var setAccListener = function() {
    $('.acc-btn').off('click').
            on('click', function(e) {
                e.preventDefault();
                var id = $(this).attr('data-id');
                if ($(this).hasClass('acc-btn-on') && $('#'+id).is(":visible")) {
                    $('.acc-layer').each(function() {
                        if ($(this).is(":visible")) {
                            closeAccLayer($(this));
                        }
                    });
                    open_dd_div1 = '';
                }
                else if ($(this).hasClass('acc-btn-on') && !$('#'+id).is(":visible")) {
                    $('.acc-layer').each(function() {
                        if ($(this).is(":visible") && $(this).attr('data-id') !== id) {
                            closeAccLayer($(this));
                        }
                    });                
                    openAccLayer($(this));
                    open_dd_div1 = id;
                }
                else {
                    $('.acc-layer').each(function() {
                        if ($(this).is(":visible")) {
                            closeAccLayer($(this));
                        }
                    });
                    open_dd_div1 = '';
                }
            }
    );
    $('.acc2-btn').off('click').
            on('click', function(e) {
                e.preventDefault();
                var id = $(this).attr('data-id');
                if ($('#'+id).is(":visible")) {
                    $('.acc2-layer').each(function() {
                        if ($(this).is(":visible")) {
                            closeAcc2Layer($(this));
                        }
                    });
                    open_dd_div2 = '';
                }
                else {
                    $('.acc2-layer').each(function() {
                        if ($(this).is(":visible") && $(this).attr('data-id') !== id) {
                            closeAcc2Layer($(this));
                        }
                    });              
                    openAcc2Layer($(this));
                    open_dd_div2 = id;
                }
            }
    );
    
    $('.ac-btn').off('click').
            on('click', function(e) {
                e.preventDefault();
                var tabid = $(this).parents('.tab-pane').attr('id');
                if (typeof tabid !== 'undefined' && tabid) {
                    if (tabid === 'tab-param-top' || tabid === 'tab-param-daily' || tabid === 'tab-param-all' || tabid === 'tab-param-ens' || tabid === 'tab-param-prob' || tabid === 'tab-param-spagh' || tabid === 'tab-param-meta') {
                        open_dd_tab_params=tabid;
                    }
                    if (tabid === 'tab-dates-date' || tabid === 'tab-dates-hour') {
                        open_dd_tab_valids=tabid;
                    }
                    if (tabid === 'tab-models-all' || tabid === 'tab-models-switch' || tabid === 'tab-models-archive') {
                        open_dd_tab_models=tabid;
                    }
                }
                if (checkChartcounter()) {
                    var model = $(this).attr('data-model');
                    if (isModelCard(model) || isReanalyseModel(model)) {
                        return switch2model(model);
                    }
                    var id = $(this).attr('data-id');
                    var value = $(this).attr('data-value');
                    var jqobj = $('#'+id).val();
                    if (typeof jqobj !== 'undefined' && typeof value !== 'undefined') {
                        $('#'+id).val(value);
                        var real_refresh = null;
                        if (id === 'model-source' && isAutoRefreshActive() && value !== $('#source-flag').val()) {
                            real_refresh = 1;
                        }
                        return refreshDropdowns(real_refresh,null,null,null,$('#'+id));
                    }
                }
                //alert('test');
            });
    $('.ac-btn-disabled').off('click').
            on('click', function(e) {
                e.preventDefault();
            });
    $('.pay-btn-disabled').off('click').
            on('click', function(e) {
                e.preventDefault();
                showExtraNotice();
            });

    $('.valid-btn').off('click').
            on('click', function(e) {
                e.preventDefault();
                var id = $(this).attr('data-value');
                if (id) {
                    if ($('.valid-btn').hasClass("btn-active")) {
                        $('.valid-btn').removeClass("btn-active");
                    }
                    $(this).addClass("btn-active");
                    open_dd_valids = id;
                    $('.valids-all').hide();
                    $('.valids-all').addClass('valids-hide');
                    $('.'+id).show();
                    $('.'+id).removeClass('valids-hide');
                }
            });
    $('.btn-fc-neighbour').off('click').
            on('click', function() {
                var new_loc=$(this).attr('data-value');
                var old_loc=$('#forecast-loc').attr('data-value');
                var new_url = $('#forecast-url').attr("data");
                if (typeof new_url !== 'undefined') {
                    new_url = new_url.replace(old_loc, new_loc);
                    if (new_url.indexOf('/kompakt') >= 0) {
                        new_url = new_url+'/'+$('#forecast-model').val();
                    }
                    var tab = $('#tab-url').attr("data-src");
                    if (tab) {
                        if (new_url.indexOf('/ensemble') >= 0 || new_url.indexOf('/xl') >= 0 ) {
                            new_url = new_url+'/'+$('#forecast-model').val();
                        }
                        new_url = new_url+'/'+tab;
                    }
                    //console.log(new_url); 
                    goto(new_url);
                }
            });
    $('.btn-fc-tab').off('click').
            on('click', function() {
                var new_loc=$(this).attr('data-value');
                var old_loc=$('#forecast-loc').attr('data-value');
                var new_url = $('#forecast-url').attr("data");
                if (typeof new_url !== 'undefined') {
                    new_url = new_url.replace(old_loc, new_loc);
                    if (new_url.indexOf('/kompakt') >= 0) {
                        new_url = new_url+'/'+$('#forecast-model').val();
                    }
                    var tab = $('#tab-url').attr("data-src");
                    if (tab) {
                        if (new_url.indexOf('/ensemble') >= 0 || new_url.indexOf('/xl') >= 0 ) {
                            new_url = new_url+'/'+$('#forecast-model').val();
                        }
                        new_url = new_url+'/'+tab;
                    }
                    //console.log(new_url); 
                    goto(new_url);
                }
            });
        $('.tab-add-location').off('click').
            on('click', function() {
                $('#settings-msg').html(loadingGif());
                $('#vh-search-modal').modal('show');
                $.get(get_url_path()+'/ajax/addlocation', {}, function(data) {
                    $('#settings-msg').html(data);
                    setTimeout(function() {
                        hoverPopover();
                        addLocationListener();
                        $('#settings-wepa-modal-label').html(
                                $('#tabbar-edit-headline').html()
                        );}, 100);
                    activateAutocomplete();
                });
            });
    $('.btn-map-gps').off('click').
            on('click', function() {
                $('.btn-map-gps').removeClass('tab-current');
                $(this).addClass('tab-current');
                var lat=$(this).attr('data-lat');
                var long=$(this).attr('data-long');
                set_to_latlong(lat,long);
            });
    $('.switch-map').off('click').
            on('click', function(e) {
                e.preventDefault();
                if (checkChartcounter()) {
                    var params = {
                        'switcher': 'grid',
                        'model' : $('#model').val(),
                        'model_valid' : $('#model-valid').val(),
                        'model_member' : $('#model-member').val(),
                        'model_run' : $('#model-picked-date').val(),
                        'model_param' : $('#model-param').val(),
                        'model_source' : $('#model-source').val() || $('#area-source').val(),
                        'model_location' : $('#model-location').val(),
                        'area_id': get_selected_area(),
                        'geo_lat' : $('#geo-lat').val(),
                        'geo_long' : $('#geo-long').val()
                    };
                    if (isObsMode($('#model').val())) {
                        params.model_run = $('#model-run').val();
                    }
                    if ($(this).hasClass('map-country')) {
                        params.switcher = 'country';
                    }
                    params.obj_mode = 'replace';
                    refreshDropdowns(false, false, params);
                }
            });
    
    $('#animation-player-mobile').html('');

    if ($('#animation-player-mobile').is(':visible')) {
        var html = $('#animation-player-mobile').html();
        if (typeof html !== 'undefined' && html.length === 0) {
            $('#animation-player-mobile').html($('#animation-player-desktop').html());
            $('#animation-player-desktop').html('');
        }
    }
    else {
        $('#animation-player-mobile').html('');
    }
    if ($('#animation-player-desktop').is(':visible')) {
        var html = $('#animation-player-desktop').html();
        if (typeof html !== 'undefined' && html.length === 0) {
            $('#animation-player-desktop').html($('#animation-player-mobile').html());
            $('#animation-player-mobile').html('');
        }
    }
    else {
        $('#animation-player-desktop').html('');
    }
}

var get_selected_area = function(jqobj) {
    var area_id = 0;
    for (i=1;i<=10;i++) {
        fieldname = '#form-areaid-'+i;
        if ($(fieldname).val() && parseInt($(fieldname).val()) > 0) {
            area_id = $(fieldname).val();
            if (jqobj && '#'+jqobj.attr('id') === fieldname) {
                break;
            }
        }
        else {
            break;
        }
    }
    return area_id;
};

var get_area_hierarchy = function() {
    var area_id = new Array(10);
    for (i=1;i<=10;i++) {
        fieldname = '#form-areaid-'+i;
        if ($(fieldname).val() && parseInt($(fieldname).val()) > 0) {
            area_id[i-1] = $(fieldname).val();
        }
        else {
            break;
        }
    }
    return area_id;
};

var get_selected_model_path = function() {
    if ($('#model').val()==='px250' || $('#model').val()==='px250blau'  || $('#model').val()==='aurora' || $('#model').val()==='wwanalyze' || $('#model').val()==='radar'|| $('#model').val()==='radarus' || $('#model').val()==='radarde' || $('#model').val()==='radarpre' || $('#model').val()==='singlepx' || $('#model').val()==='plraw' || $('#model').val()==='storms' || $('#model').val()==='floods' || $('#model').val()==='pl' || $('#model').val()==='blitze'  || $('#model').val()==='weltblitze' || $('#model').val()==='regen' || $('#model').val()==='hagel' || $('#model').val()==='radial' || $('#model').val()==='sweeps' || $('#model').val()==='radar3d' || $('#model').val()==='covid19' || $('#model').val()==='zsweeps' || $('#model').val()==='sat') {
        var model = $('#model-valid').val();
        var formModel = model.split('/');
        var run_hour = formModel[1];
        var run_date = formModel[0].split('-');
        var ret = new Array(2);
        ret[0] = run_date[0]+'_'+run_date[1]+'_'+run_date[2];
        ret[1] = run_hour;
        return ret;
    }
    var model = $('#model-run').val();
    if (typeof model === 'undefined') {
        return '';
    }
    else {
        var formModel = model.split('/');
        var run_hour = formModel[1];
        var run_date = formModel[0].split('-');
        return run_date[0]+'_'+run_date[1]+'_'+run_date[2]+'_'+run_hour;
    }
};
    
var get_model_image_path = function(satdl, set_model, set_param, set_model_valid, set_location, forecast_min) {
    var area = get_selected_area();
    var model = $('#model').val();
    if (model.substring(0,5) === 'modvh') {
        return false;
    }
    if (typeof set_model !== 'undefined' && set_model !== null) {
        model = set_model;
    }    
    var model_param = $('#model-param').val();
    if (typeof set_param !== 'undefined' && set_param !== null) {
        model_param = set_param;
    }
    var model_source = $('#model-source').val() || $('#area-source').val();
    if (typeof set_location !== 'undefined' && set_location !== null) {
        model_source = set_location;
    }
    var model_valid = $('#model-valid').val();
    if (typeof set_model_valid !== 'undefined' && set_model_valid !== null) {
        model_valid = set_model_valid;
        if(model_valid.indexOf('#') !== -1) {
            var valid_parts = model_valid.split('#');
            if(model.substring(0,3) !== 'mod' || isAnalyseModel(model) || isReanalyseModel(model)) {
                model_valid = valid_parts[0];
            } else {
                model_valid = valid_parts[0] + '#' + valid_parts[1];
            }
        }
    }
    if (model_valid && model === 'cyclone') {
        var filter_storm = $('#model-filter-storm').val();
        if (typeof filter_storm !== 'undefined' && filter_storm) {
            filter_storm = filter_storm + '-'
        }
        else {
            filter_storm = '';
        }
        var param = $('#model-param').val();
        return extServer(getImageCachePath()+model+'/'+model+'_'+$('#model-selector').val()+'_'+$('#model-run').val()+'_'+area+'_'+param+'_'+filter_storm+model_valid+'.png');
    }
    else if (model_valid) {
        var formModel = model_valid.split('/');
        var run_hour = formModel[1];
        var run_date = formModel[0].split('-');
        if (model.substring(0,3) !=='mod' || isAnalyseModel(model)) {
            var datum = run_date[0]+'_'+run_date[1]+'_'+run_date[2];
            var uhrzeit = run_hour;
            datum = datum.replace(/-/g, "_");
            uhrzeit = uhrzeit.replace(/:/g, "_");
        }
        if (typeof model_source !== 'undefined' && model_source && model === 'px250') {
            uhrzeit = uhrzeit.replace(/_/g, "");
            datum = datum.replace(/_/g, "");
            if (typeof model_param === 'undefined') {
                model_param='';
            }
            return extServer(getImageCachePath()+'flexradar/flexradar_'+datum+'_'+uhrzeit+'_'+area+'_'+model_param+'_'+model_source+'.png');
        }
        else if (model === 'radar3d') {
            let area_source = '';
            if(typeof model_source !== 'undefined' && model_source) area_source = '_' + model_source;

            var returnurl = extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+uhrzeit+'_'+area+'_'+model_param+area_source+'.png');
            return returnurl;
        } 
        else if (model === 'radarpre') {
            uhrzeit = uhrzeit.replace(/_/g, "");
            var futuremin = '000';
            if (formModel[2]) {
                futuremin = formModel[2];
            }
            if ($('#model-valid-fcspecial').val() == 'RADARAT_PRO_FX' && futuremin == '000') {
                futuremin = '005';
            }
            if ($('#model-valid-fcspecial').val() == 'RADARCH_PRO_FX' && futuremin == '000') {
                futuremin = '005';
            }
            if ($('#model-valid-fcspecial').val() == 'RADARNL_PRO_FX' && futuremin == '000') {
                futuremin = '005';
            }
            return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+area+'_'+uhrzeit+'_'+futuremin+'.png');
        }
        else if(model === 'px250' && typeof forecast_min !== 'undefined' && forecast_min !== null && /^\d{3}$/g.test(forecast_min)) {
            uhrzeit = uhrzeit.replace(/_/g, "");
            return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+area+'_'+uhrzeit+'_'+forecast_min+'.png');
        }
        else if (model === 'px250' || model === 'px250blau' || model === 'wwanalyze' || model === 'radarde' || model === 'radar' || model === 'singlepx' || model === 'pl' || model === 'plraw'
                || (model === 'radarus' && $('#model-mode').val() === 'RADARUS')) {
            uhrzeit = uhrzeit.replace(/_/g, "");
            return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+area+'_'+uhrzeit+'.png');
        }
        else if (model === 'aurora') {
            var without_seconds = uhrzeit.split('_');
            return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+without_seconds[0]+'_'+without_seconds[1]+'_'+area+'.png');
        }
        else if (model === 'blitze' || model === 'weltblitze' ) {
            uhrzeit = uhrzeit.replace(/_/g, "");
            var filter_str = '';
            if(model === 'blitze' && lightning_filter_value != 0) {
                filter_str += $('#blitze-5minonly').prop('checked') ? '_5' : '_0';
                filter_str += '_' + lightning_filter_value;
            } else {
                filter_str += $('#blitze-5minonly').prop('checked') ? '_5' : '';
            }

            return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+area+'_'+uhrzeit+filter_str+'.png');
        }
        else if (model === 'radarus' && $('#model-mode').val() === 'RADARUS_PARAM') {
            uhrzeit = uhrzeit.replace(/_/g, "");
            return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+area+'_'+model_param+'_'+uhrzeit+'.png');
        }
        else if (model === 'radarus') {
            uhrzeit = uhrzeit.replace(/_/g, "");
            var model_location = $('#model-location').val();
            if (typeof set_location !== 'undefined' && set_location !== null) {
                model_location = set_location;
            }
            return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+area+'_'+model_location+'_'+model_param+'_'+uhrzeit+'.png');
        }
        else if (model === 'hagel') {
            let area_source = '';
            if(typeof model_source !== 'undefined' && model_source) area_source = '_' + model_source;

            return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+uhrzeit+'_'+area+'_'+model_param+area_source+'.png');
        }
        else if (isReanalyseModel(model)) {
            var datum = run_date[0]+run_date[1]+run_date[2];
            var uhrzeit = run_hour;
            datum = datum.replace(/-/g, "");
            uhrzeit = uhrzeit.replace(/:/g, "");
            var lang='';
            if (model_param == 155 || model_param == 213 || model_param == 352 || model_param == 353 || model_param == 1203 || model_param == 1204) {
                lang = '-'+displayLanguage().toString().toLowerCase();
            }
            var modelstring = 'reanalyse';
            return extServer(getImageCachePath()+modelstring+'/'+modelstring+lang+'_'+model+'_'+datum+uhrzeit+'_'+area+'_'+model_param+'.png');
        }
        else if (isAnalyseModel(model)) {
            var datum = run_date[0]+run_date[1]+run_date[2];
            var uhrzeit = run_hour;
            datum = datum.replace(/-/g, "");
            uhrzeit = uhrzeit.replace(/:/g, "");
            var lang='';
            if (model_param == 155 || model_param == 213 || model_param == 352 || model_param == 353 || model_param == 1203 || model_param == 1204) {
                lang = '-'+displayLanguage().toString().toLowerCase();
            }
            var modelstring = 'analyse';
            return extServer(getImageCachePath()+modelstring+'/'+modelstring+lang+'_'+model+'_'+datum+uhrzeit+'_'+area+'_'+model_param+'.png');
        }
        else if (model === 'sat' || model === 'globus') {
            overlay_param = $('#sat-blitz-overlay-param').val();
            overlay_str = $('#sat-blitz-overlay-enabled').prop('checked') && overlay_param ? ('-' + overlay_param) : '';
            console.log(overlay_param, overlay_str);
            if (satdl === 'PNG') {
                return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+uhrzeit+'_'+area+'_'+model_param+overlay_str+'.png');
            }
            else {
                return extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+uhrzeit+'_'+area+'_'+model_param+overlay_str+'.jpg');
            }
        }
        else if (isModelCard(model)) {
            var selected_index = $('#model-valid option[value="'+model_valid+'"]').index();

            if(model_valid.indexOf('#') !== -1) {
                selected_index = $('#model-valid-hidden option[value="'+model_valid+'"]').index();
            }

            if(selected_index > $('#model-valid-hidden option').length - 1)
                selected_index = $('#model-valid-hidden option').length - 1;

            $('#model-valid-hidden').prop("selectedIndex", selected_index);
            var model_valid_hidden = $('#model-valid-hidden').val();
            var model_member = $('#model-member').val();
            var member_string = '';
            if (typeof model_member !== 'undefined' && model_member.length>0 && parseInt(model_member)>=0) {
                member_string = '_m'+model_member;
            }
            var run_date = model_valid_hidden.split('#');
            var lang = '';
            if (model_param == 155 || model_param == 213 || model_param == 352 || model_param == 353 || model_param == 1203 || model_param == 1204) {
                lang = '-'+displayLanguage().toString().toLowerCase();
            }
            var modelstring = 'model';
            if (model === 'modezseason') {
                modelstring = 'season';
            }
            else if (model === 'modezwkly') {
                modelstring = 'weekly';
            }
            else if (model === 'modcamsecmwf' || model === 'modgeosnasa') {
                modelstring = 'airquality';
            }
            else if (model === 'modgwam' || model === 'modcwam' || model === 'modewam' || model === 'modwaveecmwf' || model === 'modwavegfs') {
                modelstring = 'wave';
            }
            return extServer(getImageCachePath()+modelstring+'/'+modelstring+lang+'_'+model+'_'+run_date[0]+'_'+run_date[1]+'_'+area+'_'+model_param+member_string+'.png');
        }
        else {
            var returnurl = extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+uhrzeit+'_'+area+'_'+model_param+'.png');
            if (isObsMode(model)) {
                //Eine neue ID alle 2 Minuten, um den OBS-Images eine Gültigkeit von 2 Minuten zu geben.
                var timeId = Math.floor(Date.now() / (1000 * 60 * 2));
                if(is_playing || is_preloading) {
                    if(player_obs_url_timestamp === null) {
                        player_obs_url_timestamp = timeId;
                    }
                    returnurl = returnurl + '?'+player_obs_url_timestamp;
                } else {
                    returnurl = returnurl + '?'+timeId;
                }
            } else if (model === 'covid19') {
                var show_numbers = values_shown ? '1' : '0';
                if(!(is_playing || is_preloading) && !is_download_mode) {
                    show_numbers = '0';
                }
                returnurl = extServer(getImageCachePath()+model+'/'+model+'_'+datum+'_'+uhrzeit+'_'+area+'_'+model_param+'_'+show_numbers+'.png');
            }
            return returnurl;
        }
    }
};

var is_download_mode = false;
var get_download_image_path = function(blitz, set_model_valid, complete, forecast_min) {
    is_download_mode = true;

    if ($('#model').val() !== 'sat' && $('#model').val() !== 'globus') {
        var path = get_model_image_path(null, null, null, set_model_valid, null, forecast_min);
    }
    else {
        var path = get_model_image_path('PNG', null, null, set_model_valid, null, forecast_min);
    }

    var mode = 'download';
    if(complete) {
        mode = 'complete';
    }

    if (!Array.isArray(path) && typeof path !== 'undefined') {
        var model = $('#model').val();
        var model_param = $('#model-param').val();
        if (model === 'px250' && $('#model-source').val()) {
                model = 'flexradar';
            }
        else if (model === 'modezseason') {
                model = 'season';
            }
        else if (isReanalyseModel(model)) {
                model = 'reanalyse';
            }
        else if (isAnalyseModel(model)) {
                model = 'analyse';
            }
        else if (model === 'modezwkly') {
                model = 'weekly';
            }
        else if (model === 'modcamsecmwf' || model === 'modgeosnasa') {
                model = 'airquality';
            }
            else if (model === 'modgwam' || model === 'modcwam' || model === 'modewam' || model === 'modwaveecmwf' || model === 'modwavegfs') {
            model = 'wave';
        }
        else if (model.substring(0,3) === 'mod') {
            model = 'model';
        }
        var download = path.replace(getImageCachePath()+model+"/"+model+'_', getImageCachePath()+model+"/"+mode+"_"+model_addons(model)+'_');
        if (model_param == 155 || model_param == 213 || model_param == 352 || model_param == 353 || model_param == 1203 || model_param == 1204) {
            download = path.replace(getImageCachePath()+model+"/"+model+'-'+displayLanguage().toString().toLowerCase()+'_', getImageCachePath()+model+"/"+mode+"_"+model_addons(model)+'_');
        }
        var blitz_id = $('#blitz-id-modal').attr("data");
        if (blitz && blitz_id) {
            var filter_str = '';
            if(lightning_filter_value != 0 && model !== 'weltblitze') {
                filter_str = '_' + lightning_filter_value;
            }
            var blitzpath = 'blitz';
            if (model === 'weltblitze') { blitzpath = 'wblitz'; }
            download = getImageCachePath()+blitzpath+'/'+mode+'_'+model_addons(blitzpath)+'_'+get_selected_area()+'_'+blitz_id+filter_str+'.png';
            console.log(blitzpath+'/'+mode+'_'+model_addons(blitzpath)+'_'+get_selected_area()+'_'+blitz_id+filter_str);
        }

        is_download_mode = false;
        return download;
    }
    else {
        is_download_mode = false;
        return null;
    }
}

var get_model_overlay_path = function(trans) {
    var domain = '';
    if (trans === 'zz') {
        domain = $('#overlay-nonames').attr('data-value');
    }
    else {
        domain = $('#overlay-withnames').attr('data-value');
    }
    var area = get_selected_area();
    if (area === 500000000 || area == 500000001 || area == 500000002) {
        area = 2;
    }
    var path = Math.floor(area/100)*100;
    return domain+path+'/'+area+'.png';
};


var changeImage = function(no_history) {
    replaceOverlay();
    replaceImage(null, no_history);
    initSatTemp();
    if(!no_history)
        addHistory();
};

var replaceOverlay = function() {
    if ($('#model').val() !== 'globus' && $('#model').val() !== 'plraw') {
        $('.map-overlay>img').attr('src', get_model_overlay_path('zz')); 
        $('.map-overlay-trans>img').attr('src', get_model_overlay_path(displayCountry())); 
    }
    initVarSettings();
    
};

var isScaleAllowed = function(show, model) {
    if (    show === 'noscale' || 
            show === 'trans' || 
            show === 'PX250' || 
            show === 'RADARDE' || 
            show === 'RADAR' || 
            show === 'RADAR_CH' || 
            show === 'RADAR_AT' || 
            show === 'RADARNL' || 
            show === 'RADAR_SWE_PRO' || 
            show === 'RADAR_ESTONIA' || 
            show === 'NORWAY_RR' || 
            show === 'FINLAND_DBZH_COMPOSITE' || 
            show === 'UK_RAINRATE' || 
            show === 'SLOVENIA_RR' || 
            show === 'RADAR_SOUTHTYROL' || 
            show === 'RADAR_FRANCE' ||
            show === 'RADARFRA_PRO_COMP' ||
            show === 'PL'  ||
            show === 'PLRAW' || 
            show === 'PLDBZ2' || 
            show === 'PLRAW_DE'  || 
            show === 'PL_AT' || 
            show === 'PL_NOL'  || 
            show === 'PL_AT_NOL' || 
            show === 'FLOODS' || 
            show === 'FLOODWARNAT' || 
            show === 'STORMS' || 
            show === 'STORMSAT' || 
            show === 'STORMSNL' || 
            show === 'RADARSD' || 
            show === 'PLDBZ' || 
            show === 'RADIAL' || 
            show === 'SWEEPS' || 
            show === 'ZSWEEPS' || 
            show === '264' || // Rain-Rate
            show === 'BLITZWORLD' ||
            show === 'BLITZE' ||
            show === 'zdr' ||
            show === 'rhohv' ||
            show === 'phidp' ||
            show === 'kdp'
    ) {
        return true;
    }
    if (show && (
            model === 'hagel' ||
            model === 'covid19' || 
            model === 'regen' ||  
            isObsMode($('#model').val()))) {
        return true;
    }
    return false;
    
};
var showOrHideOpenStreetMapInfo = function() {
    showHide('#odbl_visibility','#odbl', 'hide');
    showHide('#model_image_visibility','#model-image', 'show');
    var show = $('#legends_visibility').attr('data');
    if (isScaleAllowed(show, $('#model').val())) {
        var path = displayCountry()+'/'+displayLanguageLowerCase();
        if ($('#model').val() === 'obsama') {
            path = 'vw/'+displayLanguageLowerCase();
        }
        else if ($('#model').val() === 'obs3at') {
            path = '3a/'+displayLanguageLowerCase();
        }
        var $hideDark = $('#scale-overlay img.hide-dark');
        var $hideBright = $('#scale-overlay img.hide-bright');
        var hasDarkmodeScale = $hideDark.length > 0 && $hideBright.length > 0;
        console.log("hasDarkmodeScale in showOrHideOpenStreetMapInfo(): ", hasDarkmodeScale);
        if (hasDarkmodeScale) {
            // Beide Bilder austauschen
            $hideDark.attr('src', scalePath(path)+show+".png");
            $hideBright.attr('src', scalePath(path)+show+"_dark.png");
        } else {
            $('#scale-overlay>img').attr('src', scalePath(path)+show+'.png');
        }
    }
};

var showHide = function(id_data, id_image, toggle) {
    var show = $(id_data).attr('data');
    if(show === toggle) {
        $(id_image).hide();
    }
    else {
        $(id_image).show();
    }
};

var legend_refresh_id = null;
var legend_currentXhrRequest = null;
var replaceImage = function(refresh, no_legend_update) {
    var model = $('#model').val();
    if(model == 'modvhrpd') model = 'modvhrpdid2';
    if (model === 'modvhshd' || model === 'modvhrpdid2' || model === 'modvhez' || model === 'modvhezwkly' || model === 'modvhanalyze' || model === 'modvhsoil') {
            var lang = displayLanguage().toString().toLowerCase();
            var width = 600;
            var height = 100;
            var mode = $('#acc-layer-model .btn-active').data('model');
            var param = $('#model-param option:selected').val();
            $('#legend').attr('src', '/images/modelscale/'+lang+'/'+mode+'/'+param+'_'+width+'_'+height+'.png');
            return false;
    }


    var image = get_model_image_path();
    var areas = getAreaArray();
    var area_id = get_selected_area();
    var leer = url_path+'/images/overlay/trans.png';
    if (model === 'storms' || model === 'floods') {
        var hidden_model = $('#hidden-model').val();
        if (hidden_model === 'empty') {
            $('#model-image>img').attr('src',leer); 
            $('#tstorm-image>img').attr('src',leer); 
            $('#stormtrack-image>img').attr('src',image); 
        }
        else if (hidden_model == 'pl') {
            $('#model-image>img').attr('src',get_model_image_path('',hidden_model)); 
            if ($('#hide-lightning-image').attr('data-value') !== 'false') {
                $('#tstorm-image>img').attr('src',get_model_image_path('',hidden_model).replace(/pl/g,"tstorm")); 
            }
            $('#stormtrack-image>img').attr('src',image); 
        }
        else if (hidden_model == 'px250blau') {
            $('#model-image>img').attr('src',get_model_image_path('',hidden_model)); 
            if ($('#hide-lightning-image').attr('data-value') !== 'false') {
                $('#tstorm-image>img').attr('src',get_model_image_path('',hidden_model).replace(/px250blau/g,"tstorm")); 
            }
            $('#stormtrack-image>img').attr('src',image); 
        }
        else {
            var tmp = hidden_model.split("#");
            if (parseInt(tmp[1]) > 0) {
                $('#model-image>img').attr('src',get_model_image_path('',tmp[0], tmp[1])); 
            }
            else {
                $('#model-image>img').attr('src',get_model_image_path('',tmp[0])); 
            }
            $('#tstorm-image>img').attr('src',leer); 
            $('#stormtrack-image>img').attr('src',image); 
        }
    }
    else if ((model !== 'blitze' && !isObsMode(model)) || no_legend_update) {
        $('#model-image>img').attr('src', image); 
        $('#stormtrack-image>img').attr('src',leer); 
    }
    else {
        $('#stormtrack-image>img').attr('src',leer); 
    }
    if (model === 'pl' && $('#hide-lightning-image').attr('data-value') !== 'false') {
        $('#tstorm-image>img').attr('src', image.replace(/pl/g,"tstorm")); 
    }
    else if (model !== 'storms' && model !== 'floods') {
        $('#tstorm-image>img').attr('src',leer); 
    }

    var params = {
                    'model' : $('#model').val(),
                    'model_run' : $('#model-run').val(),
                    'model_param' : $('#model-param').val(),
                    'model_source' : $('#model-source').val() || $('#area-source').val(),
                    'model_location' : $('#model-location').val(),
                    'image_width' : $('#map-overlay').width(),
                    'model_member' : $('#model-member').val(),
                    'area_id' : area_id,
                    'areas_1' : areas[1],
                    'areas_2' : areas[2],
                    'areas_3' : areas[3],
                    'areas_4' : areas[4],
                    'areas_5' : areas[5],
                    'areas_6' : areas[6],
                    'areas_7' : areas[7],
                    'areas_8' : areas[8],
                    'areas_9' : areas[9],
                    'real_refresh' : 0
                };
    if (refresh !== true) {
        params.model_valid = $('#model-valid').val();
    }
    if (isModelCard(model)) {
        params.mvh = $('#model-valid-hidden').val();
    }
    if ($('#model').val() === 'cyclone') {
        params.model_filter_storm = $('#model-filter-storm').val();
    }

    if ($('#model').val() === 'blitze' || $('#model').val() === 'weltblitze') {
        if($('#blitze-5minonly').prop('checked')) {
            params.blitze_5minonly = 'true';
        }
        if ($('#model').val() === 'blitze') {
            params.blitz_filter = lightning_filter_value;
        }
    }

    if ($('#model').val() === 'sat') {
        if($('#sat-blitz-overlay-enabled').prop('checked')) {
            params.blitz_overlay_enabled = 'true';
        }
    }

    if (is_playing !== 1 && !no_legend_update) {

        legend_refresh_id = new Date().getTime();
        var this_legend_refresh_id = legend_refresh_id;

        if(legend_currentXhrRequest != null)
            legend_currentXhrRequest.abort();

        $.get(get_url_path()+'/ajax/legende', params, function (data) {

                if(this_legend_refresh_id != legend_refresh_id)
                    return;

                legend_currentXhrRequest = null;

                $('#text-overlay').html(data);
                place_obs();
                var model = $('#model').val();
                $('#copyright_text').html('');
                if (model ==='radarus') {
                    if ($('#legends_visibility').attr('data') === 'RADARUS_COMP_PNG') {
                        $('#scale-overlay>img.hide-dark').attr('src', scalePath()+"RADARUS_COMP_PNG.png");
                        $('#scale-overlay>img.hide-bright').attr('src', scalePath()+"RADARUS_COMP_PNG_dark.png");
                    }
                    else if (radarus_is_dyn() || ($('#model-mode').val() === 'RADARUS_PARAM' && $('#model-param').val() !== '358' && $('#model-param').val() !== '432')) {
                        replaceScale();
                    }
                    else {
                        $('#scale-overlay>img.hide-dark').attr('src', scalePath()+"RADARUS.png");
                        $('#scale-overlay>img.hide-bright').attr('src', scalePath()+"RADARUS_dark.png");
                    }
                }
                else if (model==='regen' || model==='blitze' || model==='pl' || model==='cyclone' || isObsMode(model) || 
                        model === 'sat' || model === 'globus' || model === 'modmesoshd' || isModelCard(model) || isReanalyseModel(model)) {
                    replaceScale();
                }

                var text = $('#copyright_hidden').attr('data');
                if (!text) { text=''; }
                $('#copyright_text').html(text);

                if ((model === 'blitze' || model === 'weltblitze' ||  isObsMode(model)) && $('#model_image_visibility').attr('data') !== 'show') {
                    if(params.model_valid && params.model_valid == $('#model-valid').val())
                        $('#model-image>img').attr('src', image); 
                }

                var legendDate = $('#legende-date').text();
                $('#legende-date').text(moment(legendDate, getTimezoneFormat('date')).format(getTimezoneFormat('date', true)));
                checkProgSounding();
                checkTrajectories();
                initTracks();
                initFloods();
                rdfcPrognose();

                var show = $('#model_image_visibility').attr('data');
                if(show === 'show') {
                    lightning_filter();
                }

                // setTimeout(checkLoader,300);
                hoverPopover();
         });
    }
    else {
        var model_run = $('#model-run').val().split("-");
        $('#legende-date').html(model_run[2]+'.'+model_run[1]+'.'+model_run[0]);
        $('#legende-time').html($('#model-valid').val());

        var timezone = $('#real-user-timezone').attr('data-value');
        var momentDate = moment.utc($('#model-valid').val(), 'YYYY-MM-DD/HH:mm');

        var dateString = momentDate.tz(timezone).format(getTimezoneFormat('date', true));
        var timeString = momentDate.tz(timezone).format(getTimezoneFormat('time'));

        if(displayLanguage() == 'DE')
            timeString += ' Uhr';

        $('#legende-date').html(dateString);
        $('#legende-time').html(timeString);
        if (model === 'radarpre') {
            $('#rdfc-time').html(timeString);
        }
        
    }
};

var checkLoader=function(){
    var loader=$('#model-image>img')[0]; 
    if (typeof loader !== 'undefined') {
   	if(!$('#model-image>img')[0].complete){ 
            ajaxLoaderShow();
            setTimeout(checkLoader,100);
        }
   	else {
            ajaxLoaderHide();
        }
    }
}

var replaceText = function() {
    var area_id = get_selected_area();
    var areas = getAreaArray();
    $.post(get_url_path()+'/ajax/overlay', {
                    'model' : $('#model').val(),
                    'model_run' : $('#model-run').val(),
                    'model_valid' : $('#model-valid').val(),
                    'model_param' : $('#model-param').val(),
                    'model_source' : $('#model-source').val() || $('#area-source').val(),
                    'model_location' : $('#model-location').val(),
                    'area_id' : area_id,
                    'areas_1' : areas[1],
                    'areas_2' : areas[2],
                    'areas_3' : areas[3],
                    'areas_4' : areas[4],
                    'areas_5' : areas[5],
                    'areas_6' : areas[6],
                    'areas_7' : areas[7],
                    'areas_8' : areas[8],
                    'areas_9' : areas[9]
               }, function (data) {
                    $('#text-overlay').html(data);
                    place_obs();
                    replaceScale('overlay');
             });
};

var getTimezoneFormat = function(type, addDayname) {

    var tzformatInt = +$('#display-tzformat').attr('data-value');
    if(typeof tzformatInt === 'undefined') {
        tzformatInt = 1;
    }

    var shortDateStr = '';
    var shortDateTimeStr = '';
    var dateStr = '';
    var timeStr = '';
    var formatStr = '';

    switch (tzformatInt) {
        case 0:
        case 3:
        case 5:
        case 6:
        case 8:
            timeStr = 'hh:mma';
            break;
        case 1:
        case 2:
        case 4:
        case 7: 
        case 9:
            timeStr = 'HH:mm';
            break;
    }

    switch (tzformatInt) {
        case 0:
        case 2:
            dateStr = 'MM/DD/YYYY';
            shortDateStr = 'MM/DD';
            shortDateTimeStr = 'MM/DD';
            break;
        case 1: 
        case 5:
            dateStr = 'DD.MM.YYYY';
            shortDateStr = 'DD.MM.';
            shortDateTimeStr = 'DD.MM.';
            break;
        case 3:
        case 4:
            dateStr = 'DD/MM/YYYY';
            shortDateStr = 'DD/MM';
            shortDateTimeStr = 'DD/MM';
            break;
        case 6:
        case 7:
            dateStr = 'YYYY-MM-DD';
            shortDateStr = 'MM-DD';
            shortDateTimeStr = 'MM-DD';
            break;
        case 8:
        case 9:
            dateStr = 'DD-MM-YYYY';
            shortDateStr = 'DD-MM';
            shortDateTimeStr = 'DD-MM';
            break;
    }

    formatStr = dateStr + ', ' + timeStr;

    if(addDayname) {
        dateStr = 'ddd ' + dateStr;
        shortDateStr = 'ddd ' + shortDateStr;
    }
        

    formatStr = dateStr + ', ' + timeStr;

    if(type == 'time')
        return timeStr;

    if(type == 'date')
        return dateStr;
    
    if(type == 'shortdate')
        return shortDateStr;

    if(type == 'shortdatetime')
        return shortDateTimeStr + ', ' + timeStr;
    

    return formatStr;
};

var model_hour_prev = function() {
    if (checkChartcounter()) {
        $('#model-year-block').val('blockyear');
        model_x_change_index_prev('#model-valid','prev');
    }
};
var model_date_prev = function() {
    if (checkChartcounter()) {
        $('#model-year-block').val('blockyear');
        model_x_change_index_prev('#model-run','prev');
    }
};
var model_year_prev = function() {
    if (checkChartcounter()) {
        model_x_change_index_prev('#model-year', 'prevyear');
    }
};

var model_x_change_index_prev = function(mid, prev) {
    var selected = model_player_get_selected_index(mid);
    var items = model_valids_get_item_count(mid+" option");
    var newsel = selected + 1;
    if($(mid+" .valids-hide").length>0) {
        var valclass = $('.valid-btn.btn-active').data('value');
        newsel = selected + $(mid+' option:selected').nextUntil('.'+valclass).length + 1;
        console.log(newsel);
    }
    if (selected < items) {

        if(mid == '#model-valid') {
            if($(mid+" option").eq(newsel).val() > $(mid+" option").eq(selected).val()) {
                preload_mode = 'next';
            }
            else {
                preload_mode = 'prev';
            }
        }

        $(mid).prop("selectedIndex", newsel);
        $(mid).trigger('change');
    }
    else {
        preload_mode = null;
        refreshDropdowns(null, null, null, prev);
    }
};

var model_x_change_index_next = function (mid) {
    var selected = model_player_get_selected_index(mid);
    var newsel = selected - 1;
    if($(mid+" .valids-hide").length>0) {
        var valclass = $('.valid-btn.btn-active').data('value');
        newsel = selected - $(mid+' option:selected').prevUntil('.'+valclass).length - 1;
        console.log(newsel);
    }
    if (selected > 0) {

        if(mid == '#model-valid') {
            if($(mid+" option").eq(newsel).val() > $(mid+" option").eq(selected).val()) {
                preload_mode = 'next';
            }
            else {
                preload_mode = 'prev';
            }
        }

        $(mid).prop("selectedIndex", newsel);
        $(mid).trigger('change');
    }
    else {
        preload_mode = null;
        refreshDropdowns(null, null, null, 'next');
    }
};

var model_hour_next = function() {
    if (checkChartcounter()) {
        $('#model-year-block').val('blockyear');
        model_x_change_index_next('#model-valid');
    }
};
var model_date_next = function() {
    if (checkChartcounter()) {
        $('#model-year-block').val('blockyear');
        model_x_change_index_next('#model-run');
    }
};
var model_year_next = function() {
    if (checkChartcounter()) {
        model_x_change_index_next('#model-year');
    }
};

var model_x_prev = function(mid) {
    var selected = model_player_get_selected_index(mid);
    if (selected < player_range_value[1]) {
        $(mid).prop("selectedIndex", selected + 1);
       	if (selected + 1 < player_range_value[1]) {
	    	images_islast = 0;
	    }
	    else {
	    	images_islast = 1;
	    } 
    }
    else {
        $(mid).prop("selectedIndex", player_range_value[0]);
    }
    if (is_playing === 1) {
        replacePlayerImage(mid);
    }
    else {
        changePlayerImage(mid);
    }
};

var model_x_next = function(mid) {
    var selected = model_player_get_selected_index(mid);
    if (selected > player_range_value[0]) {
        $(mid).prop("selectedIndex", selected - 1);
        if (selected - 1 > player_range_value[0]) {
    		images_islast = 0;
    	}
    	else {
    		images_islast = 1;
    	}
    }
    else {
        $(mid).prop("selectedIndex", player_range_value[1]);
    }
    if (is_playing === 1) {
        replacePlayerImage(mid);
    }
    else {
        changePlayerImage(mid);
    }
};

var changePlayerDropdowns = function() {
    var data = $("#radar-animation").val();
    var opt = data.split('/');
    $('#model-run').val(opt[0]);
    $('#model-valid').val(opt[1]);
};

var changePlayerImage = function(domid) {
    replacePlayerImage(domid, true);
    initSatTemp();
};

var replacePlayerImage = function(domid, flag_skip) {
    var model = $('#model').val();
    if (model === 'modvhshd') {
        return false;
    }
    //changePlayerDropdowns();
    var model_valid = $(domid).val();
    var initial_model_valid = model_valid;

    var forecast_min = null;
    var change_forecast_time = model === 'radarpre' || model === 'px250';
    if(model == 'px250') {
        var optEl = $(domid + ' option[value="'+model_valid+'"]');
        if(optEl.hasClass('radar-forecast')) {
            forecast_min = optEl.attr('data-fcminute');
            var run_ts = optEl.attr('data-run');
            model_valid = moment.unix(run_ts).tz('UTC').format('YYYY-MM-DD/HH:mm') + '#' + moment.unix(run_ts).format('YYYY-MM-DD/HH:mm')
        }
    }

    if (model_valid) {
        var image = get_model_image_path(null, null, null, model_valid, null, forecast_min);

        model_valid = initial_model_valid;

        var meta_data_split = model_valid.split('#');
        var data = meta_data_split[0];
        var opt = data.split('/');

        if (model === 'radarpre') {
            var futuremin = '000';
            if (opt[2]) {
                futuremin = opt[2];
            }
            if ($('#model-valid-fcspecial').val() == 'RADARAT_PRO_FX' && futuremin == '000') {
                futuremin = '005';
            }
            if ($('#model-valid-fcspecial').val() == 'RADARCH_PRO_FX' && futuremin == '000') {
                futuremin = '005';
            }
            if ($('#model-valid-fcspecial').val() == 'RADARNL_PRO_FX' && futuremin == '000') {
                futuremin = '005';
            }
            if (parseInt(futuremin)>0) {
                forecast_min = parseInt(futuremin); // Wird später gebraucht, für rf
                showAdditionalInfo();
                $('#legend-parameter #parameter-text').text('Niederschlagsradar (Prognose) (mm/h)');
            }
            else {
                if($('.additional-info-element').is(':visible')) change_forecast_time = false;
                $('.additional-info-element').stop(false).fadeOut(150);
                $('#legend-parameter #parameter-text').text('Niederschlagsradar (mm/h)');
            }
        }

        if(model === 'px250') {
            var legende = $('#legend-parameter #parameter-text').text();
            if (typeof legende !== 'undefined') {
                legende = legende.replace(' (Prognose)','').replace(' (Forecast)','');
                if(forecast_min !== null) {
                    showAdditionalInfo();
                    if(displayLanguage() == 'DE')
                        $('#legend-parameter #parameter-text').text(legende+' (Prognose)');
                    else
                        $('#legend-parameter #parameter-text').text(legende+' (Forecast)');

                } else {
                    if($('.additional-info-element').is(':visible')) change_forecast_time = false;
                    hideAdditionalInfo();
                    $('#legend-parameter #parameter-text').text(legende);
                }
            }
        }
        
        var leer = url_path+'/images/overlay/trans.png';

        //console.log('flag_skip'+flag_skip+' includes: '+loaded_image_sources.includes(image)+ ' -- '+image);
        if (flag_skip === true || loaded_image_sources.indexOf(image) != -1) {
            $('#model-image>img').attr('src', image); 
        }
        if (model === 'storms' || model === 'floods') {
            var hidden_model = $('#hidden-model').val();
            if (hidden_model === 'empty') {
                $('#model-image>img').attr('src',leer); 
                $('#tstorm-image>img').attr('src',leer); 
                $('#stormtrack-image>img').attr('src',image); 
            }
            else if (hidden_model == 'pl') {
                $('#model-image>img').attr('src',get_model_image_path('',hidden_model,null,model_valid)); 
                if ($('#hide-lightning-image').attr('data-value') !== 'false') {
                    $('#tstorm-image>img').attr('src',get_model_image_path('',hidden_model,null,model_valid).replace(/pl/g,"tstorm")); 
                }
                $('#stormtrack-image>img').attr('src',image); 
            }
            else if (hidden_model == 'px250blau') {
                $('#model-image>img').attr('src',get_model_image_path('',hidden_model,null,model_valid)); 
                if ($('#hide-lightning-image').attr('data-value') !== 'false') {
                    $('#tstorm-image>img').attr('src',get_model_image_path('',hidden_model,null,model_valid).replace(/px250blau/g,"tstorm")); 
                }
                $('#stormtrack-image>img').attr('src',image); 
            }
            else {
                var tmp = hidden_model.split("#");
                if (parseInt(tmp[1]) > 0) {
                    $('#model-image>img').attr('src',get_model_image_path('',tmp[0], tmp[1],model_valid)); 
                }
                else {
                    $('#model-image>img').attr('src',get_model_image_path('',tmp[0],null,model_valid)); 
                }
                $('#tstorm-image>img').attr('src',leer); 
                $('#stormtrack-image>img').attr('src',image); 
            }
        }
        else if (model === 'pl') {
            $('#tstorm-image>img').attr('src', image.replace(/pl/g,"tstorm")); 
        }
        else  {
            $('#tstorm-image>img').attr('src',leer); 
        }
        if (model !== 'storms' && model !== 'floods') {
            $('#stormtrack-image>img').attr('src',leer); 
        }


        var dateString = '';
        var timeString = '';

        var dateDom = '';
        var timeDom = '';

        if(model.substring(0,3)!=="mod" || isAnalyseModel(model)) {

            var momentDate = moment(meta_data_split[1], 'YYYY-MM-DD/HH:mm');

            if($('#player-is-daily-param').length && $('#player-is-daily-param').attr('data-value') === 'true') {
                
                if($('.lp_valid_small').length) {
                    var timezone = $('#real-user-timezone').attr('data-value');

                    var timePeriod = ')';
                    if(displayLanguage() == 'DE')
                        timePeriod = ' Uhr' + timePeriod;

                    timePeriod = momentDate.tz(timezone).format(getTimezoneFormat('shortdatetime')) + timePeriod;
                    momentDate.subtract(24, 'hours');
                    timePeriod = ' - ' + timePeriod;
                    timePeriod = '(' + momentDate.tz(timezone).format(getTimezoneFormat('shortdatetime')) + timePeriod;
                    $('.lp_valid_small').text(timePeriod);
                } else {
                    momentDate.subtract(24, 'hours');
                }

            }

            var dateString = momentDate.format(getTimezoneFormat('date', true));
            var timeString = momentDate.format(getTimezoneFormat('time'));

            if(displayLanguage() == 'DE')
                timeString += ' Uhr';

            dateDom = '#legende-date';
            timeDom = '#legende-time'
        } else if(isReanalyseModel(model)) {
            dateDom = '#legende-complete-date';

            var momentDate = moment.utc(meta_data_split[0], 'YYYY-MM-DD/HH:mm');
            // momentDate.add(meta_data_split[2], 'hours');
            
            var timezone = $('#real-user-timezone').attr('data-value');

            var dateString = momentDate.tz(timezone).format(getTimezoneFormat('date', true));
            var timeString = momentDate.tz(timezone).format(getTimezoneFormat('time'));
            var tzString = meta_data_split[3] || '';

            if(displayLanguage() == 'DE')
                timeString += ' Uhr';

            timeString += ' ' + tzString;

            dateString += ' ' + timeString
        }
        else {
            $('#legende-modelrun').html(meta_data_split[2].replace(", ", "/"));

            var momentDate = moment.utc(meta_data_split[0], 'YYYYMMDDHH');
            if(meta_data_split[1].indexOf('-')) {
                var hour_minutes = meta_data_split[1].split('-');
                var hour = +hour_minutes[0];
                var minutes = +hour_minutes[1];
                momentDate.add(hour, 'hours');
                momentDate.add(minutes, 'minutes');
            } else {
                momentDate.add(meta_data_split[1], 'hours');
            }
            
            var timezone = $('#real-user-timezone').attr('data-value');

            var dateString = momentDate.tz(timezone).format(getTimezoneFormat('date', true));
            var timeString = momentDate.tz(timezone).format(getTimezoneFormat('time'));

            if(displayLanguage() == 'DE')
                timeString += ' Uhr';

            dateDom = '#legende-complete-date #legende-date';
            timeDom = '#legende-complete-date #legende-time';
        }

        $(dateDom).html(dateString);
        $(timeDom).html(timeString);
        if (change_forecast_time) {
            $('#rdfc-time').html(timeString);
        }
    }
};

var model_player_first = function() {
    var items = model_player_get_item_count();
    $("#radar-animation").prop("selectedIndex", items);
    changePlayerImage();
};
var model_player_last = function() {
    $("#radar-animation").prop("selectedIndex", 0);
    changePlayerImage();
};

var model_player_prev = function(domid) {
    var model = $('#model').val();
    if(model.substring(0,3) === 'mod' && !isAnalyseModel(model)) {
        model_x_next(domid);
    }
    else {
    	model_x_prev(domid);
    }
};

var model_player_next = function(domid) {
    var model = $('#model').val();
    if(model.substring(0,3) === 'mod' && !isAnalyseModel(model) && !isReanalyseModel(model)) {
        model_x_prev(domid);
    }
    else {
        model_x_next(domid);
    }
};


var model_player_get_selected_index = function(name) {
    return $(name).prop("selectedIndex");
};

var model_valids_get_item_count = function(name) {
	if(name.substring(0,16)=="#radar-animation"){
    	var ret = ($(name).length*images_extend/images_extend_max)-1;
    }
    else{
    	var ret = ($(name).length)-1;
    }
    return ret;
}

var model_player_get_item_count = function() {
    return Math.abs(player_range_value[1] - player_range_value[0] + 1);
};

var animate = null;
var is_playing = 0;
var current_image = 0;
var max_images;
var player_obs_url_timestamp = null;


var switch_player_button_mode = function(mode) {
    mode = (mode === undefined) ? 'play' : mode;

    var btn = $('.kw-play-button');
    var icon = btn.find('i');

    if(mode == 'play') {
        icon.removeClass('kw-play').addClass('kw-stop');
    }
    if(mode == 'stop') {
        icon.removeClass('kw-stop').addClass('kw-play');
    }
}

var model_player_start_stop = function() {
    var btn = $('.player_btn_div .kw-play-button');
    var icon = btn.find('i');

    if(icon.hasClass('kw-play')){
        model_player_start();
    } else {
        model_player_stop_button();
    }
}

var modelcharts_player_start_stop = function() {
    var btn = $('.player_btn_div2 .kw-play-button');
    var icon = btn.find('i');

    if(icon.hasClass('kw-play')){
        modelcharts_player_start(2);
    } else {
        modelcharts_player_stop();
    }
}

var model_player_start = function(nohistory) {
    switch_player_button_mode('play');
    if (is_playing === 1) {
        return false;
    };

    //stopAutoRefresh();

    current_image = model_player_get_selected_index('#model-valid');
    if ($('#model').val() === 'radarpre') {
        $('#radar-animation').prop("selectedIndex", 24);
        player_range_value=[player_range_start, player_range_end];
        ajaxLoaderShow();
    }
    if (nohistory != 2) {
        trackPlayer('#radar-animation',model_player_get_item_count().toString());
    }
    if (nohistory != 1) {
       addHistory(1);
    }
    max_images = model_player_get_item_count();
    //ajaxLoaderShow();
    model_player_load();
};

var modelcharts_player_start = function(nohistory) {
    switch_player_button_mode('play');
    
    if (is_playing === 1) {
        return false;
    };
    if (nohistory != 1) {
       addHistory(1);
    }
    var intervall = $('#model-player-interval').val();
    max_images = model_player_get_item_count();
    if (nohistory != 2) {
        trackPlayer("#modelcharts-animation-"+intervall,max_images);
    }
    current_image = model_player_get_selected_index('#model-valid');
    //ajaxLoaderShow(true);
    modelcharts_player_load();
};

var modelcharts_player_stop = function() {
    is_playing = 0;
    is_playing_first = true;
    images=[]; // buffers for preloading loop images
    loaded_image_sources=[];
    images_loaded=0;
    loading=0;
    addHistory(2);
    switch_player_button_mode('stop');
    refreshDropdowns(null, null, null, null, null, true);
};

var model_player_stop = function() {
    is_playing = 0;
    player_obs_url_timestamp = null;
    is_playing_first = true;
    images=[]; // buffers for preloading loop images
    loaded_image_sources=[];
    images_loaded=0;
    loading=0;
    switch_player_button_mode('stop');
    player_hide_progress();
    clearInterval(player_load_session);
    player_load_session = null;
    is_preloading = false;
    hideAdditionalInfo();
    initSatTemp();
    addHistory(2);
    var model = $('#model').val();
    if (isObsMode(model) || model === 'blitze'|| model === 'weltblitze') {
        var show = $('#model_image_visibility').attr('data');
        if (show === 'show') {
            $('#model-image').hide();
            var mapmarker = $('#map-marker').css('display');
            $('#text-overlay .value-container').show();
            $('#map-marker').css('display',mapmarker);
        }
        $('.lp_area').show();
    }
};

var model_player_stop_button = function() {
    model_player_stop();
    var starttime = $('#player-start-time').attr('data-value');
    if(typeof starttime !== 'undefined' && starttime.length>0) {
        var no_history = true;
        if($('#player-is-daily-param').attr('data-value') === 'true')
            no_history = null;

        refreshDropdowns(false, null, null, null, null, no_history);
    }
    else {
        refreshDropdowns(3, null, null, null, null, true);
    }
}

var frame_count_orig=-1;
var model_player_extend_button = function() {
	if (loading==1 || images_extend===images_extend_max) {
        return false;
    };
    model_player_stop();
    var images_counter = 12;
    if(frame_count_orig<0){
    	frame_count_orig=images_extend_max*document.getElementById('frame_count').innerHTML;
    }
    if     (images_extend==1){images_extend=2; images_counter=24;}
    else if(images_extend==2){images_extend=4; images_counter=48;}
    else if(images_extend==3){images_extend=6; images_counter=72;}
    else if(images_extend==4){images_extend=8; images_counter=96;}
    else                     {images_extend=1;}
    $('#frame_count').html((frame_count_orig*images_extend/images_extend_max));
    //console.log(frame_count_orig+" "+images_extend+" "+images_extend_max);
    images=[]; // buffers for preloading loop images
    loaded_image_sources=[];
    images_loaded=0;
    loading=0;
    $('#radar-animation').prop("selectedIndex", 0);
    trackPlayer('#radar-animation', images_counter.toString());
    model_player_start(2);
}

var model_player_extend_level = function(level) {
    images_extend=level;
    model_player_stop();
    if(frame_count_orig<0 && document.getElementById('frame_count')){
    	frame_count_orig=images_extend_max*document.getElementById('frame_count').innerHTML;
    }
    $('#frame_count').html((frame_count_orig*images_extend/images_extend_max));
    images=[]; // buffers for preloading loop images
    loaded_image_sources=[];
    images_loaded=0;
    loading=0;
    model_player_start(2);
}

var model_player_speed = function() {
    if (is_playing == 0) {
        model_player_start();
    }
    else {
        model_player_stop_button();
    }
}
var model_player_load = function() {
    images=[];
    preload_image_animation("#radar-animation");
};
var modelcharts_player_load = function() {
    images=[];
    var intervall = $('#model-player-interval').val();
    preload_image_animation("#modelcharts-animation-"+intervall);
};

var preload_mode = null;
var preload_chart = function() {
    var preload_count = $('#preload-count').attr('data-value');
    if(!preload_count || !$('#model').val() || $('#main-image-content').length == 0) return;

    var mode = preload_mode;

    if(!mode)
        mode = 'init';

    
    var model_valids_to_preload = [];
    var selected_option = $('#model-valid option:selected');
    var selected_option_index = selected_option.index();
    var options = $('#model-valid option');
    var model_valid = $('#model-valid').val();
    model_valids_to_preload.push(model_valid);
    var model = $('#model').val();
    for(var i = 1; i <= preload_count; i++) {
        var new_next_index = selected_option_index + i;
        var new_prev_index = selected_option_index - i;

        var valid_next, valid_prev = undefined;

        if(new_next_index >= 0)
            var valid_next = options.eq(new_next_index).val();

        if(new_prev_index >= 0)
            var valid_prev = options.eq(new_prev_index).val();

        // console.log({selected_option_index: selected_option_index, i: i, new_next_index: new_next_index, new_prev_index: new_prev_index, valid_next: valid_next, valid_prev: valid_prev});

        if(mode == 'init' && i <= Math.round(preload_count / 2)) {
            if(valid_next) model_valids_to_preload.push(valid_next);
            if(valid_prev) model_valids_to_preload.push(valid_prev);
        } else if(mode == 'next') {
            if(valid_next && valid_next > model_valid) model_valids_to_preload.push(valid_next);
            if(valid_prev && valid_prev > model_valid) model_valids_to_preload.push(valid_prev);
        } else if(mode == 'prev') {
            if(valid_next && valid_next < model_valid) model_valids_to_preload.push(valid_next);
            if(valid_prev && valid_prev < model_valid) model_valids_to_preload.push(valid_prev);
        }
    }
    
    //console.table([mode, ...model_valids_to_preload]);
    preload_mode = null;
    

    var preload_urls = [];
    var logObj = {};
    $(model_valids_to_preload).each(function(index) {
        logArray = [];
        // console.log(this);

        var image = get_model_image_path(null, null, null, this);
        if(!image) return;
        if (model === 'storms' || model === 'floods') {
            var hidden_model = $('#hidden-model').val();
            if (hidden_model == 'pl' || hidden_model == 'px250blau') {
                preload_urls.push(get_model_image_path(null, hidden_model, null, this)); 
                if ($('#hide-lightning-image').attr('data-value') !== 'false') {
                    preload_urls.push(get_model_image_path(null, hidden_model, null, this).replace(/pl|px250blau/g,"tstorm"));
                    logArray.push(get_model_image_path(null, hidden_model, null, this).replace(/pl|px250blau/g,"tstorm")); 
                }
            }
            else if (hidden_model !== 'empty') {
                var tmp = hidden_model.split("#");
                if (parseInt(tmp[1]) > 0) {
                    preload_urls.push(get_model_image_path(null, tmp[0], tmp[1], this));
                    logArray.push(get_model_image_path(null, tmp[0], tmp[1], this));
                }
                else {
                    preload_urls.push(get_model_image_path(null, tmp[0], null, this));
                    logArray.push(get_model_image_path(null, tmp[0], null, this));
                }
            }
        }

        if (model === 'pl' && $('#hide-lightning-image').attr('data-value') !== 'false') {
            image.replace(/pl/g,"tstorm");
        }

        if($('#model_image_visibility').attr('data') == 'hide') {
            preload_urls.push(image);
            logArray.push(image);
        }

        logObj[this] = logArray;
    });

    // console.table(logObj);
    preload_image_array(preload_urls);
}

var preload_id = null;
var preload_image_array = function(preload_urls, start_index, callback_progress, callback_finished) {
    //console.log(preload_urls);

    if(!preload_urls.length) return;

    preload_id = new Date().getTime();
    var this_preload_id = preload_id;

    var preload_cache_container = $('#preload-cache-container');
    if(!preload_cache_container.length)
        preload_cache_container = $('<div id="preload-cache-container"></div>').appendTo('body');

    var parallel_proc = $('#parallel-proc').attr('data-value');
    if (typeof parallel_proc === 'undefined')
        parallel_proc = 1;
    
    parallel_proc = parseInt(parallel_proc);

    var max_images = preload_urls.length;

    if(typeof start_index !== 'number' || (start_index % 1) !== 0)
        start_index = 0;

    var numFinished = 0;
    var errorOccured = 0;

    var direction = -1;
    var currentOffset = 0;

    var currentLoopFinishedCount = 0;

    /**
     * 
     * @param {*} index 
     * @param {*} mode 1 -> init / 2 -> load / 3 -> error
     */
    var onloadHandler = function(index, mode) {

        var stopped = preload_id !== this_preload_id;

        if(mode == 2 || mode == 3) {
            numFinished++;
            currentLoopFinishedCount++;
        }

        //console.log({this_preload_id: this_preload_id, mode: mode, numFinished: numFinished, currentLoopFinishedCount: currentLoopFinishedCount, parallel_proc: parallel_proc, max_images: max_images });

        if(mode == 3) {
            errorOccured = 1;
        }
        if(typeof callback_progress === 'function' && !stopped)
            callback_progress(index, numFinished, mode);
        

        if(numFinished >= max_images) {

            if(!stopped)
                preload_id = null;

            if(typeof callback_finished === 'function' && !stopped)
                callback_finished(errorOccured);

            return;
        }
        
        if(currentLoopFinishedCount >= parallel_proc && numFinished < max_images) {
            if(stopped) {
                if(typeof callback_finished === 'function')
                    callback_finished(2);

                return;
            }

            currentLoopFinishedCount = 0;
            setTimeout(loadLoop, 2);
        }
    };

    var loadImage = function(index) {
        url = preload_urls[index];
        if(preload_cache_container.find('img.preload-cache-image[src="'+url+'"]').length) {
            onloadHandler(index, 2);
            return;
        }

        onloadHandler(index, 1);

        var bild = new Image();
        bild.onload = function(){ onloadHandler(index, 2); };
        bild.onerror = function(){ preload_cache_container.find('img.preload-cache-image[src="'+url+'"]').remove(); onloadHandler(index, 3); };
        bild.src = url;
        bild.className = 'preload-cache-image';
        bild.style.display = 'none';

        $(bild).prependTo(preload_cache_container);
    }
    
    var loadInitCount = 0;
    var loadLoop = function() {
        var i = 0;
        var watchCount = 0;
        while(i < parallel_proc && watchCount < 200) {
            var index = direction * currentOffset + start_index;

            //console.log({this_preload_id: this_preload_id, preload_id: preload_id, index: index, i: i, loadInitCount: loadInitCount, watchCount: watchCount});

            if(loadInitCount >= max_images) break;
            if(preload_id !== this_preload_id) break;

            if(typeof preload_urls[index] !== 'undefined') {
                loadImage(index);
                i++; loadInitCount++;
            }

            if(start_index == 0) {
                currentOffset++;
                direction = 1;
            } else if(start_index == max_images - 1) {
                currentOffset ++;
                direction = -1;
            } else {
                if(direction == -1) currentOffset ++;
                direction *= -1;
            }

            watchCount++;
        }
    };

    loadLoop();
};

var stop_preload_image_array = function() {
    preload_id = null;
};


var player_load_session = null;
var is_preloading = false;
var preload_image_animation = function(domid, isGif) {

    is_preloading = true;

    player_reset_progress();
    setTimeout(player_show_progress, 10);
    //player_show_progress();

    $('#ajax-loading-progress .progress-bar').css('width', '0%');

    clearInterval(player_load_session);
    player_load_session = null;

    var parallel_proc = $('#parallel-proc').attr('data-value');
    if (typeof parallel_proc === 'undefined') {
        parallel_proc = 1;
    }
    parallel_proc = parseInt(parallel_proc);

    //Fill Image Url Array
    var image_url_array = [];

    var model = $('#model').val();
    var area = get_selected_area();
    var is_obs_mode = isObsMode(model);
    var is_radarus_dyn = radarus_is_dyn();
    var max_preload_images = model_player_get_item_count();
    var player_session_range_count = max_preload_images;


    $(domid).find('option').each(function(index) {

        if(image_url_array.length >= max_preload_images) return;

        if(index < player_range_value[0] || index > player_range_value[1]) return;

        var optionEl = $(this);

        var model = $('#model').val();
        var area = get_selected_area();
        var is_obs_mode = isObsMode(model);
        var is_radarus_dyn = radarus_is_dyn();

        var delay_multiplier = 1;

        if(index < player_range_value[1] && (model.substring(0,3) === 'mod' && !isAnalyseModel(model) && !isReanalyseModel(model)) && $('#model-player-interval').val() != 999) {
            var intervall_h = $('#model-player-interval').val() || '1';

            var intervall_min = 0;
            if(intervall_h.indexOf('min') !== -1) {
                intervall_min = parseInt(intervall_h.substring(0,intervall_h.indexOf('min')));
            }
            
            var currentTs = $(domid).find('option').eq(index).val().split('#');
            var nextTs = $(domid).find('option').eq(index+1).val().split('#');

            var currentHour = moment.utc(currentTs[0], 'YYYYMMDDHH');
            var nextHour = moment.utc(nextTs[0], 'YYYYMMDDHH');

            var current_hour = currentTs[1];
            if(current_hour.indexOf('-') !== -1) {
                var current_hour_minute = current_hour.split('-'); 
                current_hour = +current_hour_minute[0];
                var current_minutes = +current_hour_minute[1];
                currentHour.add(current_hour, 'hours');
                currentHour.add(current_minutes, 'minutes');
            }
            else {
                currentHour.add(current_hour, 'hours');
            }

            var next_hour = nextTs[1];
            if(next_hour.indexOf('-') !== -1) {
                var next_hour_minute = next_hour.split('-'); 
                next_hour = +next_hour_minute[0];
                var next_minutes = +next_hour_minute[1];
                nextHour.add(next_hour, 'hours');
                nextHour.add(next_minutes, 'minutes');
            }
            else {
                nextHour.add(next_hour, 'hours');
            }

            if(intervall_min != 0)
                delay_multiplier = (nextHour - currentHour) / (intervall_min * 60*1000);
            else
                delay_multiplier = (nextHour - currentHour) / (intervall_h * 60*60*1000);

        }

        var model_valid = optionEl.val();
        var forecast_min = null;

        if(optionEl.hasClass('radar-forecast')) {
            forecast_min = optionEl.attr('data-fcminute');
            var run_ts = optionEl.attr('data-run');
            model_valid = moment.unix(run_ts).tz('UTC').format('YYYY-MM-DD/HH:mm') + '#' + moment.unix(run_ts).format('YYYY-MM-DD/HH:mm')
        }

        if(!isGif) {
            var image = get_model_image_path(null, null, null, model_valid, null, forecast_min);
            if(image) {
                image_url_array.push([image, delay_multiplier]);
                
                var show_lightning = $('#hide-lightning-image').attr('data-value') !== 'false';

                if(model === 'storms' || model === 'floods') {
                    var hidden_model = $('#hidden-model').val();
                    if (hidden_model == 'pl' || hidden_model == 'px250blau') {
                        image_url_array.push([get_model_image_path(null, hidden_model, null, model_valid), 0]);
                        max_preload_images++;

                        if(show_lightning) {
                            image_url_array.push([get_model_image_path(null, hidden_model, null, model_valid).replace(/pl|px250blau/g,"tstorm"), 0]);
                            max_preload_images++;
                        }
                    } 
                    else if (hidden_model !== 'empty') {
                        var tmp = hidden_model.split("#");
                        if(parseInt(tmp[1]) > 0) {
                            image_url_array.push([get_model_image_path(null, tmp[0], tmp[1], model_valid), 0]);
                        } else {
                            image_url_array.push([get_model_image_path(null, tmp[0], null, model_valid), 0]);
                        }
                        max_preload_images++;
                    }
                }

                if(model === 'pl' && show_lightning) {
                    image_url_array.push([image.replace(/pl/g, 'tstorm'), 0]);
                    max_preload_images++;
                }

            }
        } else {
            var image = get_download_image_path(null, model_valid, true, forecast_min);
            if(image)
                image_url_array.push([image, delay_multiplier]);            
        }
    });

    var images_loaded = 0;
    var images_to_load = parallel_proc;
    var loading_in_process = false;

    $('img.animation-cache-image').remove();

    var isPremiumParam = $('.ac-btn[data-value='+$('#model-param').val()+']').hasClass('pay-btn');

    player_load_session = setInterval(function() {

        if(player_load_session == null || model_player_get_item_count() != player_session_range_count) return;

        //Exit intervall loop - All images are loaded
        if(images_loaded >= max_preload_images) {
            $('#ajax-loading-progress .progress-bar').css('width', '100%');
            player_load_progress = max_preload_images;
            player_update_load_progress();

            clearInterval(player_load_session);
            player_load_session = null;
            is_preloading = false;

            if(!isGif) {
                is_playing = 1;
                setTimeout(function() {
                    ajaxLoaderHide();
                    player_hide_progress();
                    model_player_data_cache = [];
                    model_player_play(domid);
                }, 300);
            } else {
                ajaxLoaderHide();
                player_hide_progress();
                produceGifv2(domid);
            }

        }

        
        if(images_loaded < images_to_load && !loading_in_process) {
            loading_in_process = true;

            var mustPrepend = $('#radar-animation').length > 0 || isReanalyseModel(model) ;

            for (var image_index = images_loaded; image_index < images_to_load && image_index < image_url_array.length; image_index++) {
                var bild = new Image();
                var url = image_url_array[image_index][0];
                var delay_multiplier = image_url_array[image_index][1];
                bild.setAttribute("data-url", url);
                bild.onload = function(){ images_loaded_increment(); loaded_image_sources.push(this.getAttribute('data-url')); };
                bild.onerror = function(){ images_loaded_increment(); bild.setAttribute('data-error-loading', "true"); };

                bild.setAttribute('data-delay-multiplier', delay_multiplier);

                if(isGif) {
                    bild.crossOrigin = 'use-credentials';
                    if(url.indexOf('?') !== -1) {
                        bild.src = url + '&cors=true';
                    } else {
                        bild.src = url + '?cors=true';
                    }
                }
                else {
                    bild.src = url;
                }

                bild.className = 'animation-cache-image';
                bild.style.display = 'none';

                if(mustPrepend)
                    $(bild).prependTo($(domid).parent());
                else
                    $(bild).appendTo($(domid).parent());
            }

        }

    }, 10);

    var images_loaded_increment = function() {
        if(player_load_session == null)
            return;

        images_loaded++;

        if(model_player_get_item_count() == player_session_range_count) {
            var percentage = (images_loaded / image_url_array.length * 100).toFixed(3);
            $('#ajax-loading-progress .progress-bar').css('width', percentage + '%');
    
            player_load_progress = images_loaded;
            player_update_load_progress(image_url_array.length);
        }

        if(images_loaded >= images_to_load) {
            loading_in_process = false;
            images_to_load += parallel_proc;
        }
    }

}

// var lastTs = 0;
var model_player_play_handle = null;
var model_player_data_cache = [];
var model_player_play = function(domid) {
    //console.log(images);
    if (is_playing === 1) {
        if (is_playing_first === true) {
            is_playing_first = false;

            var model = $('#model').val();
            if (isObsMode(model) || model === 'blitze'|| model === 'weltblitze') {
                var show = $('#model_image_visibility').attr('data');
                if (show === 'show') {
                    $('#model-image').show();
                    $('#text-overlay .value-container').hide();
                }
                $('.lp_area').hide();
            } else if(model === 'covid19') {
                $('#text-overlay .value-container').hide();
            }

            $(domid).prop("selectedIndex", player_range_value[0]);
        }

        // NUR FÜR DEBUG
        // if($(domid).prop("selectedIndex") == 0) {
        //     console.log('Current timestamp: ' + $(domid).val().split('#')[1] + ' | Should Delay: ' + 8*images_delay[images_speed] + 'ms | Real Delay: ' + (performance.now() - lastTs).toFixed(2) + 'ms');
        // } else {
        //     console.log('Current timestamp: ' + $(domid).val().split('#')[1] + ' | Should Delay: ' + images_delay[images_speed] + 'ms | Real Delay: ' + (performance.now() - lastTs).toFixed(2) + 'ms');
        // }

        var delay_multiplier = 1;
        model_player_next(domid);

        clearTimeout(model_player_play_handle);
        if(images_islast==0){
            var model = $('#model').val();

            if(model.substring(0,3) === 'mod' && !isAnalyseModel(model) && !isReanalyseModel(model) && $('#model-player-interval').val() != 999) {
                
                var intervall_h = $('#model-player-interval').val() || '1';

                var intervall_min = 0;
                if(intervall_h.indexOf('min') !== -1) {
                    intervall_min = parseInt(intervall_h.substring(0,intervall_h.indexOf('min')));
                }
                
                var currentIndex = $(domid).prop('selectedIndex');

                if(typeof model_player_data_cache[currentIndex] === 'undefined') {
                    model_player_data_cache[currentIndex] = moment.utc($(domid).val().split('#')[0], 'YYYYMMDDHH');
                    var first_hour = $(domid).val().split('#')[1];
                    if(first_hour.indexOf('-') !== -1) {
                        var first_hour_minute = first_hour.split('-'); 
                        first_hour = +first_hour_minute[0];
                        var first_minutes = +first_hour_minute[1];
                        model_player_data_cache[currentIndex].add(first_hour, 'hours');
                        model_player_data_cache[currentIndex].add(first_minutes, 'minutes');
                    }
                    else {
                        model_player_data_cache[currentIndex].add(first_hour, 'hours');
                    }
                }
                if(typeof model_player_data_cache[currentIndex + 1] === 'undefined') {
                    model_player_data_cache[currentIndex + 1] = moment.utc($(domid).find('option').eq(currentIndex+1).val().split('#')[0], 'YYYYMMDDHH');
                    var next_hour = $(domid).find('option').eq(currentIndex+1).val().split('#')[1];
                    if(next_hour.indexOf('-') !== -1) {
                        var next_hour_minute = next_hour.split('-'); 
                        next_hour = +next_hour_minute[0];
                        var next_minutes = +next_hour_minute[1];
                        model_player_data_cache[currentIndex + 1].add(next_hour, 'hours');
                        model_player_data_cache[currentIndex + 1].add(next_minutes, 'minutes');
                    }
                    else {
                        model_player_data_cache[currentIndex + 1].add(next_hour, 'hours');
                    }
                }

                if(intervall_min != 0)
                    delay_multiplier = (model_player_data_cache[currentIndex + 1] - model_player_data_cache[currentIndex]) / (intervall_min * 60*1000);
                else
                    delay_multiplier = (model_player_data_cache[currentIndex + 1] - model_player_data_cache[currentIndex]) / (intervall_h * 60*60*1000);

            }

            model_player_play_handle = setTimeout(function() { model_player_play(domid); }, delay_multiplier * images_delay[images_speed]);
        }
        else{
            model_player_play_handle = setTimeout(function() { model_player_play(domid); }, 8*images_delay[images_speed]);
            images_islast=0;
        }
        // lastTs = performance.now();
    }
    else {
        return false;
    }
};


var place_obs = function(retry) {

    if(values_shown) {
        $('#text-overlay .value-container').show();
    }
    else {
        $('#text-overlay .value-container').hide();
    }

    // Geolocation
    var geo_x = $('#geo-x').val(); geo_x = parseInt(geo_x)-10;
    var geo_y = $('#geo-y').val(); geo_y = parseInt(geo_y)-20;

    if (parseInt(geo_x)>0 && parseInt(geo_y)>0) {
        $('#map-marker').attr("data-left", geo_x);
        $('#map-marker').attr("data-top", geo_y);
        $('#map-marker').show();
    }


    var factor = parseInt($('#map-overlay').width());
    $('#text-overlay').css('width', factor);
   
    // Chrome's too fast, so retry a little bit later
    if (retry !== true) {
        setTimeout(function(){place_obs(true);}, 500);
    }
    var abstand = get_abstand();
    $('.ap').each(function(){
        var left = parseInt($(this).attr('data-left'));
        var top = parseInt($(this).attr('data-top'));
        if (left < 2 || left > 725 || top < 0 || top > 600) {
            $(this).css('display', 'none');
        }
        else {
            $(this).css('left', ((left/760)*factor+abstand)+'px');
            $(this).css('top', ((top/760)*factor)+'px');
        }
    });
    $('.lp').each(function(){
        var left = parseInt($(this).attr('data-left'));
        var top = parseInt($(this).attr('data-top'));
        if (left < 0) {
            $(this).css('right', ((left/760)*factor*(-1))+'px');
        }
        else {
            $(this).css('left', (((left/760)*factor+abstand))+'px');
        }
        if($(this).hasClass('lp_updatetimes')) {
            var height = $('#main-image-content').height();
            $(this).css('top', ((top/760)*height)+'px');
        } else {
            $(this).css('top', ((top/760)*factor)+'px');
        }
        if (factor < 260) {
            $(this).css('display', 'none');
        }
        else if (factor < 321) {
            if (!block_hiding_loadinglayer_when_loading) {
                $(this).css('display', 'block');
            }
            $(this).css('font-size', '8px');
            $('.lp_valid').css('font-size', '7px');
            $('.lp_updatetimes').css('font-size','7px');
            $('.lp_valid_small').css('font-size', '6px');
            $('.lp_param').css('font-size', '10px');
            $('.lp_param.lp_param_small').css('font-size', '8px');
            $('.sat-blitz-overlay-legend').css('transform', 'scale(0.4) rotate(45deg)');
            $('.lp_cyclone_middle, .lp_lightning_big').css('font-size', '8px');
            $('.faq-button-param').css('font-size', '10px');
            $('.faq-button-param').css('margin-left', '5px');
        }
        else if (factor < 400) {
            if (!block_hiding_loadinglayer_when_loading) {
                $(this).css('display', 'block');
            }
            $(this).css('font-size', '8px');
            $('.lp_valid').css('font-size', '8px');
            $('.lp_updatetimes').css('font-size','8px');
            $('.lp_valid_small').css('font-size', '6px');
            $('.lp_param').css('font-size', '11px');
            $('.lp_param.lp_param_small').css('font-size', '9px');
            $('.sat-blitz-overlay-legend').css('transform', 'scale(0.5) rotate(45deg)');
            $('.lp_cyclone_middle, .lp_lightning_big').css('font-size', '9px');
            $('.faq-button-param').css('font-size', '12px');
            $('.faq-button-param').css('margin-left', '5px');
        }
        else if (factor < 460) {
            if (!block_hiding_loadinglayer_when_loading) {
                $(this).css('display', 'block');
            }
            $(this).css('font-size', '9px');
            $('.lp_updatetimes').css('font-size','9px');
            $('.lp_valid_small').css('font-size', '7px');
            $('.lp_param').css('font-size', '14px');
            $('.lp_param.lp_param_small').css('font-size', '11px');
            $('.sat-blitz-overlay-legend').css('transform', 'scale(0.6) rotate(45deg)');
            $('.lp_cyclone_middle, .lp_lightning_big').css('font-size', '10px');
        }
        else if (factor < 540) {
            if (!block_hiding_loadinglayer_when_loading) {
                $(this).css('display', 'block');
            }
            $(this).css('font-size', '10px');
            $('.lp_updatetimes').css('font-size','10px');
            $('.lp_valid_small').css('font-size', '8px');
            $('.lp_param').css('font-size', '16px');
            $('.lp_param.lp_param_small').css('font-size', '13px');
            $('.sat-blitz-overlay-legend').css('transform', 'scale(0.7) rotate(45deg)');
            $('.lp_cyclone_middle, .lp_lightning_big').css('font-size', '12px');
        }
        else if (factor < 620) {
            if (!block_hiding_loadinglayer_when_loading) {
                $(this).css('display', 'block');
            }
            $(this).css('font-size', '11px');
            $('.lp_updatetimes').css('font-size','11px');
            $('.lp_valid_small').css('font-size', '9px');
            $('.lp_param').css('font-size', '18px');
            $('.lp_param.lp_param_small').css('font-size', '15px');
            $('.sat-blitz-overlay-legend').css('transform', 'scale(0.8) rotate(45deg)');
            $('.lp_cyclone_middle, .lp_lightning_big').css('font-size', '14px');
        }
        else if (factor < 760) {
            if (!block_hiding_loadinglayer_when_loading) {
                $(this).css('display', 'block');
            }
            $(this).css('font-size', '12px');
            $('.lp_updatetimes').css('font-size','12px');
            $('.lp_valid_small').css('font-size', '10px');
            $('.lp_param').css('font-size', '20px');
            $('.lp_param.lp_param_small').css('font-size', '16px');
            $('.sat-blitz-overlay-legend').css('transform', 'scale(0.9) rotate(45deg)');
            $('.lp_cyclone_middle, .lp_lightning_big').css('font-size', '16px');
        }
        else {
            if (!block_hiding_loadinglayer_when_loading) {
                $(this).css('display', 'block');
            }
            $(this).css('font-size', '14px');
            $('.lp_updatetimes').css('font-size','11px');
            $('.lp_valid_small').css('font-size', '10px');
            $('.lp_param').css('font-size', '24px');
            $('.lp_param.lp_param_small').css('font-size', '19px');
            $('.sat-blitz-overlay-legend').css('transform', 'scale(1) rotate(45deg)');
            $('.lp_cyclone_middle, .lp_lightning_big').css('font-size', '19px');
        }
    });

    if (!block_hiding_loadinglayer_when_loading) {
        $('.lp_wait').css('display','none');
    }
    // $('#sld_model_player_speed').slider({min:0, max:10, value:images_speed, slide:function(event,ui){images_speed=ui.value;}});
    $('#sld_model_player_speed').bootstrapSlider({
        formatter: function(value) {

            if(typeof images_delay[value] === 'undefined')
                return '';

            var fps = Math.round(1000 / images_delay[value]);
            var format = $('#sld_model_player_speed').attr('data-tooltip-label');
            if (typeof format !== 'undefined') { 
                return format.replace('{value}', fps);
            }
            return format;
        },
        tooltip_position: 'bottom',
        value: images_speed,
        max: images_delay.length - 1,
    }).off('slide slideStart slideStop').on('slide slideStart slideStop', function(event) {
        var val = event.value;
        images_speed = val;

        if(event.type == 'slideStop' && (is_playing || is_preloading)) {
            addHistory(1);
        }
    });

    if(!is_playing)
        showOrHideOpenStreetMapInfo();

};

var setup_sliders = function(is_intervall_change) {
    setup_player_slider(is_intervall_change);
    setup_lightning_slider();
}

var destroy_sliders = function() {
    destroy_player_slider();
    destroy_lightning_slider();
}

var player_slider = null;
var destroy_player_slider = function() {
    if(player_slider) {
        $('#player-range-slider').bootstrapSlider('destroy');
        player_slider = null;
    }
}

var setup_player_slider = function(is_intervall_change) {

    var radar = $('#radar-animation').length > 0;
    var model_player_interval = $('#model-player-interval').val();
    var player_item_domid = radar || typeof model_player_interval === 'undefined' ? '#radar-animation' : '#modelcharts-animation-' + model_player_interval;
    player_range_end = $(player_item_domid).find('option').length - 1;


    if(player_slider || $('#player-range-slider').length == 0) return;
    if($('#radar-animation').length == 0 && $('#model-player-interval').length == 0) return;

    var isRadarForecast = $('#radar-animation option').hasClass('radar-forecast');
    var isRadarModelchartsMix = $('#model').val() == 'modera5'; //Animation wie Radar, aber mit Intervallauswahl

    moment.relativeTimeThreshold('m', 60);
    moment.relativeTimeThreshold('h', 24);
    moment.relativeTimeThreshold('d', 30);

    var timezone = $('#real-user-timezone').attr('data-value');

    if(!radar) {
        if(is_intervall_change) {

            //Find closeset dates
            var oldInt = $('#model-player-interval').data('prev');
            var hourIndex = isRadarModelchartsMix ? 2 : 1;
            var oldStartHour = $('#modelcharts-animation-' + oldInt).find('option').eq(player_range_value[0]).val().split('#')[hourIndex];
            var oldEndHour = $('#modelcharts-animation-' + oldInt).find('option').eq(player_range_value[1]).val().split('#')[hourIndex];

            if(oldStartHour.indexOf('-') !== -1) {
                var old_start_hour_minute = oldStartHour.split('-');
                var oldStartHour = +old_start_hour_minute[0] + (+old_start_hour_minute[1] / 60);
            }

            if(oldEndHour.indexOf('-') !== -1) {
                var old_end_hour_minute = oldEndHour.split('-');
                var oldEndHour = +old_end_hour_minute[0] + (+old_end_hour_minute[1] / 60);
            }
            oldStartHour = +oldStartHour;
            oldEndHour = +oldEndHour;

            var newStartHour = 0;
            var newEndHour = 0;
            var beforeHour = 0;

            var newStartIndex = 0;
            var newEndIndex = 0;

            // var log = [];

            $(player_item_domid).find('option').each(function(thisIndex) {
                var el = $(this);

                var thisHour = $(this).val().split('#')[hourIndex];
                if(thisHour.indexOf('-') !== -1) {
                    var this_hour_minute = thisHour.split('-');
                    var thisHour = +this_hour_minute[0] + (+this_hour_minute[1] / 60);
                }
                thisHour = +thisHour;

                if(Math.abs(thisHour - oldStartHour) < Math.abs(thisHour - newStartHour)) {
                    newStartHour = thisHour;
                    newStartIndex = el.index();
                }
                    
                if(Math.abs(thisHour - oldEndHour) < Math.abs(beforeHour - oldEndHour)) {
                    newEndHour = thisHour;
                    newEndIndex = el.index();
                }
                beforeHour = thisHour;

                // log.push({el: el.val(), thisHour, oldStartHour, newStartHour, newStartIndex, oldEndHour, newEndHour, newEndIndex});

            });
            
            player_range_value = [newStartIndex, newEndIndex];
            // if(isRadarModelchartsMix) player_range_value = [player_range_end - newStartIndex, player_range_end - newEndIndex];
            // console.table(log);
        } else {
            if(!isRadarModelchartsMix)
                player_range_value[1] = $(player_item_domid).find('option').length - 1;
        }
    }

    var moment_from_value = radar || isRadarModelchartsMix
    ? 
        function(optionValue) {
            //function used for radar-animation values

            var date_string = optionValue.split('#');
            return moment.utc(date_string[0], 'YYYY-MM-DD/HH:mm');
        }
    :
        function(optionValue) {
            //function used for model-animation values

            var date_string = optionValue.split('#');
            var moment_date = moment.utc(date_string[0], 'YYYYMMDDHH');

            var hours = date_string[1];
            if(date_string[1].indexOf('-') !== -1) {
                var hour_minute = date_string[1].split('-'); 
                hours = +hour_minute[0];
                var minutes = +hour_minute[1];
                moment_date.add(hours, 'hours');
                moment_date.add(minutes, 'minutes');
            }
            else {
                moment_date.add(+hours, 'hours');
            }

            return moment_date;
        }
    ;

    var time_format = getTimezoneFormat('time');
    var date_format = getTimezoneFormat('shortdate', true);

    var tooltipFix = function() {
        //Fix tooltip position
        var margin = 10;

        var arrowPosX = $('#player-range-slider').parent().find('.tooltip-main .tooltip-arrow').offset().left + $('#player-range-slider').parent().find('.tooltip-main .tooltip-arrow').outerWidth() / 2;
        var tooltipWidth = $('#player-range-slider').parent().find('.tooltip-main .tooltip-inner').outerWidth();

        var windowWidth = $(window).width();

        $('#player-range-slider').parent().find('.tooltip-min').hide();
        $('#player-range-slider').parent().find('.tooltip-max').hide();

        if(arrowPosX < tooltipWidth / 2 + margin) {
            var translate = tooltipWidth / 2 - arrowPosX + margin;
            $('#player-range-slider').parent().find('.tooltip-main').css('margin-left', translate+'px');
            $('#player-range-slider').parent().find('.tooltip-main .tooltip-arrow').css('transform', 'translateX('+(-translate)+'px)');
        }

        if(windowWidth - arrowPosX < tooltipWidth / 2 + margin) {
            var translate = -(tooltipWidth / 2 - (windowWidth - arrowPosX) + margin);
            $('#player-range-slider').parent().find('.tooltip-main').css('margin-left', translate+'px');
            $('#player-range-slider').parent().find('.tooltip-main .tooltip-arrow').css('transform', 'translateX('+(-translate)+'px)');
        }
    }

    var formatter = function(value) {

        if(Array.isArray(value)) {
            var start_moment = moment_from_value($(player_item_domid).find('option').eq(value[0]).val());
            var end_moment = moment_from_value($(player_item_domid).find('option').eq(value[1]).val());
    
            var format;
            if(start_moment.tz(timezone).isSame(end_moment, 'day'))
                format = time_format;
            else
                format = date_format + ' ' + time_format;

            if($('#player-is-daily-param').attr('data-value') === 'true') {
                start_moment.subtract(24, 'hours');
                end_moment.subtract(24, 'hours');
            }
            
            if(!$('select#model-valid').length) {
                format = date_format;
            }

            var tooltip = '';
            if(end_moment > start_moment) {
                tooltip = start_moment.tz(timezone).format(format) + ' - ' + end_moment.tz(timezone).format(format);
            }
            else {
                tooltip = end_moment.tz(timezone).format(format) + ' - ' + start_moment.tz(timezone).format(format);
            }

            return tooltip;
        } else {
            var moment_val = moment_from_value($(player_item_domid).find('option').eq(value).val());
            return moment_val.tz(timezone).format('lll');
        }
    }

    var onSlideStart = function(event) {
        $('#player-range-slider').parent().find('.slider-track .slider-selection .load-progress').addClass('no-transition');
        onSlide(event);
    };

    var onSlide = function(event) {
        //console.log(event);

        //Update global vars
        var oldValue = player_range_value;
        player_range_value = event.value;

        if(player_range_value[0] != oldValue[0] || player_range_value[1] != oldValue[1]) {

            player_update_load_progress();
            tooltipFix();

            var start_moment = moment_from_value($(player_item_domid).find('option').eq(player_range_value[0]).val());
            var end_moment = moment_from_value($(player_item_domid).find('option').eq(player_range_value[1]).val());
            player_update_loop_span(start_moment, end_moment);
            

            var changedValue = player_range_value[0] != oldValue[0] ? player_range_value[0] : player_range_value[1];

            //console.table([oldValue, player_range_value]);

            // $(player_item_domid).prop('selectedIndex', changedValue);
            // replacePlayerImage(player_item_domid, true);
        }

    };

    var onSlideStop = function(event) {
        onSlide(event);
        $('#player-range-slider').parent().find('.slider-track .slider-selection .load-progress').removeClass('no-transition');
        
        if(is_playing || is_preloading) {
            if(radar) {
                model_player_stop();
                model_player_start(2);
            } else {
                model_player_stop();
                modelcharts_player_start(2);
            }

        } else {
            // changeImage();
        }
    };

    if(isAnalyseModel($('#model').val())) {
        var animation_val = $(player_item_domid).find('option').eq(player_range_value[0]).val();
        var model_valid = $('#model-valid').val();

        if(animation_val.indexOf(model_valid) === -1) {
            var selected_animation_index = $('#radar-animation option[value^="'+$('#model-valid').val()+'"]').index();
            var range = player_range_value[1] - player_range_value[0];
            if(selected_animation_index + range > player_range_end)
                selected_animation_index = player_range_end - range;

            player_range_value = [selected_animation_index, selected_animation_index + range];
        }
    }

    var rangeHighlights = [];
    if(radar) {
        if(isRadarForecast) {
            var startIndex = $('#radar-animation option.radar-forecast').first().index();
            var endIndex = $('#radar-animation option.radar-forecast').last().index();
            
            rangeHighlights.push({
                start: startIndex,
                end: endIndex,
                class: 'radar-forecast'
            });

            if(player_range_radar_forecast_offset == 0) {
                if(player_range_value[0] == 0) {
                    player_range_value = [endIndex + 1 - 6, player_range_value[1] + endIndex + 1];
                } else {
                    player_range_value = [player_range_value[0] + endIndex + 1, player_range_value[1] + endIndex + 1];
                }
            }
        } else {
            if(player_range_radar_forecast_offset != 0) {
                var newStart = player_range_value[0] - (player_range_radar_forecast_offset+1);
                var newEnd = player_range_value[1] - (player_range_radar_forecast_offset+1);

                //console.log({player_range_value, player_range_radar_forecast_offset});

                if(newStart < 0) newStart = 0;
                if(newEnd <= 0) newEnd = 12;

                player_range_value = [newStart, newEnd];
            }
        }

        player_range_radar_forecast_offset = endIndex || 0;
    }

    player_slider = $('#player-range-slider').bootstrapSlider({
        range: true,
        min: player_range_start,
        max: player_range_end,
        value: player_range_value,
        reversed: radar || isRadarModelchartsMix,
        formatter: formatter,
        rangeHighlights: rangeHighlights
    });

    var progress_div = $('<div class="load-progress-container"><div class="load-progress move-out"></div></div>');

    if(radar || isRadarModelchartsMix)
        progress_div.find('.load-progress').addClass('reversed');

    $('#player-range-slider').parent().find('.slider-track .slider-selection:not(.slider-rangeHighlight)').append(progress_div);

    player_slider.on('slide', onSlide);
    player_slider.on('slideStart', onSlideStart);
    player_slider.on('slideStop', onSlideStop);

    player_update_load_progress();

    var start_moment = moment_from_value($(player_item_domid).find('option').eq(player_range_value[0]).val());
    var end_moment = moment_from_value($(player_item_domid).find('option').eq(player_range_value[1]).val());
    player_update_loop_span(start_moment, end_moment);
    tooltipFix();
}

var player_update_loop_span = function(start_moment, end_moment) {


    var duration;
    if(end_moment < start_moment)
        duration = moment.duration(start_moment.diff(end_moment));
    else
        duration = moment.duration(end_moment.diff(start_moment));

    var months = duration.months();
    var days = duration.days();
    var hours =  duration.hours();
    var minutes = duration.minutes();

    var span_string = '';

    if(months > 0) 
        span_string += moment.duration(months, 'months').humanize() + ' ';
    
    if(days > 0)
        span_string += moment.duration(days, 'days').humanize() + ' ';

    if(hours > 0 || minutes > 0) {
        if(hours < 10)
            hours = '0' + hours;

        if(minutes < 10)
            minutes = '0' + minutes;

        span_string += hours + ':' + minutes + 'h';
    }


    $('#player-loop-span').text(span_string);
}

var player_hide_progress = function() {
    $('#player-range-slider').parent().find('.slider-track .slider-selection .load-progress').addClass('move-out');
}

var player_show_progress = function() {
    $('#player-range-slider').parent().find('.slider-track .slider-selection .load-progress').removeClass('move-out');
}

var player_reset_progress = function() {
    player_load_progress = 0;
    player_update_load_progress();
}

var player_update_load_progress = function(max_items) {

    if(typeof max_items !== 'number' || max_items < 1) {
        max_items = model_player_get_item_count();
    }

    var progress = player_load_progress / max_items;
    var width = (progress * 100).toFixed(3);

    $('#player-range-slider').parent().find('.slider-track .slider-selection .load-progress').css('width', width+'%');
}

var get_abstandY = function() {
    if (displayCountry() == 'vh') {
        if (parseInt($('.container').width())<=720) {
            return -50;
        }
        /*else if (parseInt($('.app-content').width()) <= 874) {
            return -65;
        */
        return 0;
    }
    return 30;
};
var get_abstand = function() {
    var abstand = 10;
    if (displayCountry() == 'vh') {
        if (parseInt($('.container').width()) < 945) {
            abstand = 15;
        }
        return abstand;
    }
    else {
        if (parseInt($('.container').width()) < 940) {
            abstand = 15;
        }
        return abstand;
    }
};

var resize_video = function() {
    //resize_video_all(1.778, '.youtube-video');
    resize_video_all(1.778, '.youtube-video');
    if ($('body').width()>= 992) {
        $('.youtube-index-video').each(function() {
            $( this ).replaceWith('<iframe class="youtube-index-video-ifr" width="267" height="150" src="https://www.youtube.com/embed/'+$( this ).attr('data-src')+'" frameborder="0" allowfullscreen></iframe>');
        });
    }
    resize_video_all(1.778, '.youtube-index-video-ifr');
    var faktor1 = 1;
    var faktor2 = 1;
    var htmlwidth=$(document).width();
    if (htmlwidth >= 1200) {
        faktor1 = 1.333;
        faktor2 = 1.778;
    }
    else if (htmlwidth >= 998) {
        faktor1 = 1.5;
        faktor2 = 1.778;
    };
    resize_video_all(faktor1, '.vine-video-detail');
    resize_video_all(faktor2, '.vine-video');
};

var resize_video_all = function(fact, select) {
    $(select).each(function(){
        var size = parseInt($(this).parent('div').width());
        var modal = parseInt($('#faq-modal>div').width())-40;
        if (select === '.youtube-video') {
            size = modal;
        }
        $(this).attr('width', size);
        $(this).attr('height', (size/fact));
    });
};

var replaceScale = function(test) {
    $('#copyright_text').html('');
    var model = $('#model').val();

    // Prüfen ob zwei Bilder mit .hide-dark und .hide-bright vorhanden sind
    var $hideDark = $('#scale-overlay img.hide-dark');
    var $hideBright = $('#scale-overlay img.hide-bright');
    var hasDarkmodeScale = $hideDark.length > 0 && $hideBright.length > 0;

    if (model !== 'blitze' && model !== 'pl' && !isModelCard(model) && !isReanalyseModel(model) && model !== 'regen' && !isObsMode(model) && model !== 'modmesoshd') {
        if (hasDarkmodeScale) {
            // Beide Bilder austauschen
            $hideDark.attr('src', scalePath()+$('#model-param').val()+".png");
            $hideBright.attr('src', scalePath()+$('#model-param').val()+"_dark.png");
        } else {
            $('#scale-overlay>img').attr('src', scalePath()+$('#model-param').val()+".png");
        }
    }
    if (isModelCard(model) || isReanalyseModel(model) || model == 'modmesoshd') {
        if (hasDarkmodeScale) {
            // Beide Bilder austauschen
            $hideDark.attr('src', scalePath('model/'+displayCountry())+model+'/'+model+'_'+$('#model-param').val()+'.png');
            $hideBright.attr('src', scalePath('model/'+displayCountry())+model+'/'+model+'_'+$('#model-param').val()+'_dark.png');
        } else {
            $('#scale-overlay>img').attr('src', scalePath('model/'+displayCountry())+model+".png");
        }
    }
    if (isObsMode(model) || model === 'sat' || model === 'blitze' || model === 'pl' || model === 'px250' || model == 'covid19' || model === 'cyclone' || isModelCard(model) || isReanalyseModel(model)) {
        var text = $('#copyright_hidden').attr('data');
        if (!text) {
            text='';
        }
        $('#copyright_text').html(text);
    }
}

var model_addons = function(model) {
    var ret = model;
    var lang = $('#display-language').attr('data-value');
    var tz = $('#display-timezone').attr('data-value');
    var tzf = $('#display-tzformat').attr('data-value');
    var overlay = $('#map-overlay-setting').attr('data-value');
    if (lang.length == 2) {
        ret = ret + '-' +lang;
        if (tz.length == 3) {
            ret = ret + '-' +tz;
            if (parseInt(tzf)>=0 && parseInt(tzf)<10) {
                ret = ret + '-' +tzf;
                if (overlay === '0') {
                    ret = ret + '-zz'; 
                }
                else if (overlay === '2') {
                    ret = ret + '-xz'; 
                }
            }
        }
    }
    return ret;
}

var save_as = function(blitz) {
    var download = get_download_image_path(blitz);
    if(download) {
        document.location.href = download;
    } else {
        alert('Download nicht möglich!');
    }
};

var toggle_lightnings = function() {
    $('#lightning-image').toggle();
};

var setLastParamId = function() {
    if ($('#model').val() === 'sat') {
        last_param_id = parseInt( $('#model-param').val());
    }
}


var loadTrend14days = function(version) {
    console.log(version);
    if (typeof version === 'undefined' ) {
        version='v2';
    }
    $.get(get_url_path()+'/ajax_pub/weathertrend14days', {
                'city_id':$('#weather-trend14days-page').attr('data-city'),
                'lang':displayLanguage().toString().toLowerCase(),
                'unit_t':displayFCUnitT(),
                'unit_v':displayFCUnitV(),
                'unit_l':displayFCUnitL(),
                'unit_r':displayFCUnitR(),
                'unit_p':displayFCUnitP(),
                'version':version,
                'nf':displayNumberFormat(),
                'tz':$('#real-user-timezone').attr('data-value'),
                'tf':displayTimeformat()

            }, function (data) {
                if(data === 'TOO_MANY_REQUESTS') show429Error();
                if (data !== 'Not found' && data !== 'TOO_MANY_REQUESTS') {
                    $('#weather-forecast-trend14days').html(data);
                    setTimeout(function() {
                        var version14days = $('#trend-14days').attr('data-version');
                        if (typeof version14days === 'undefined' ) {
                            version14days = version;
                        }
                        console.log(version14days);
                        if (typeof version14days !== 'undefined' && version14days.length>0 && version14days !== 'v3.1' && version14days !== 'v1') {
                            plotWeatherTrend14daysV2();
                        }
                        else {
                            console.log('v3.1/v1 loading');
                            plotWeatherTrend14days();
                        }
                    },300);
                }
                else {
                    $('#weather-forecast-trend14days').replaceWith('');
                }
            },'html');
};

var switch2radar = function(fl_reset) {
    model_player_stop(); setLastParamId();
    if (fl_reset === true) {
        refreshDropdowns(2, null, {model: 'px250', obj_mode: 'extend', fl_radial: 'reset'});
    }
    else {
        // $('#model').val('px250');
        refreshDropdowns(2, null, {model: 'px250', obj_mode: 'extend'});
    }
};

var switch2flexradial = function() {
    model_player_stop();
    open_dd_div1 = 'acc-layer-sources';
    refreshDropdowns(2, null, {model: 'px250', obj_mode: 'extend', fl_radial: 'select'});
}

var switch2wwanalyze = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('wwanalyze');
    $('#legends_visibility').attr('data','');
    $('#scale-overlay>img.hide-dark').attr('src', scalePath()+'WWANALYZE.png');
    $('#scale-overlay>img.hide-bright').attr('src', scalePath()+'WWANALYZE_dark.png');
    refreshDropdowns(2, null, {model: 'wwanalyze', obj_mode: 'extend'});
};

var switch2rain_rate = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('wwanalyze');
    $('#legends_visibility').attr('data','');
    $('#scale-overlay>img.hide-dark').attr('src', scalePath()+'264.png');
    $('#scale-overlay>img.hide-bright').attr('src', scalePath()+'264_dark.png');
    //refreshDropdowns(2, null, {model: 'wwanalyze', obj_mode: 'extend'});
};

var switch2radarde = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('radarde');
    $('#legends_visibility').attr('data','');
    refreshDropdowns(2, null, {model: 'radarde', obj_mode: 'extend'});
    //$('#scale-overlay>img').attr('src', scalePath()+'RADARDE.png');
};

var switch2radarsd = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('radar');
    $('#legends_visibility').attr('data','');
    refreshDropdowns(2, null, {model: 'radar', obj_mode: 'extend'});
    //$('#scale-overlay>img').attr('src', scalePath()+'RADARSD.png');
};

var switch2hagel = function(paramid) {
    model_player_stop(); setLastParamId();
    // $('#model').val('hagel');
    $('#legends_visibility').attr('data','');
    refreshDropdowns(false, paramid, {model: 'hagel', obj_mode: 'extend'});
};

var switch2radar3d = function(paramid) {
    model_player_stop(); setLastParamId();
    // $('#model').val('radar3d');
    $('#legends_visibility').attr('data','');
    $('#scale-overlay>img.hide-dark').attr('src', scalePath('model/'+displayCountry())+'neutral.png');
    $('#scale-overlay>img.hide-bright').attr('src', scalePath('model/'+displayCountry())+'neutral_dark.png');
    refreshDropdowns(false, paramid, {model: 'radar3d', obj_mode: 'extend'});
};

var switch2radarpre = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('radarpre');
    $('#legends_visibility').attr('data','');
    refreshDropdowns(1, null, {model: 'radarpre', obj_mode: 'extend'});
    //$('#scale-overlay>img').attr('src', scalePath()+'RADAR.png');
};


var switch2model = function(model) {
    model_player_stop(); 
    // $('#model').val(model);
    $('#legends_visibility').attr('data','')
    refreshDropdowns(null, null, {model: model, obj_mode: 'extend'});
};

var switch2singlepx = function() {
    model_player_stop();
    $('#model').val('singlepx');
    $('#legends_visibility').attr('data','')
    refreshDropdowns(2, null, {model: 'singlepx', obj_mode: 'extend'});
    //$('#scale-overlay>img').attr('src', scalePath()+'ZSWEEPS.png');
};


var switch2plraw = function() {
    model_player_stop();
    // $('#model').val('plraw');
    $('#legends_visibility').attr('data','')
    $('#map-overlay-trans').hide();
    $('#map-overlay').hide();
    $('#map-underlay-trans').hide();
    $('#map-underlay').hide();
    refreshDropdowns(2, null, {model: 'plraw', obj_mode: 'extend'});
};

var switch2sweeps = function() {
    model_player_stop();
    // $('#model').val('sweeps');
    $('#legends_visibility').attr('data','');
    refreshDropdowns(3, null, {model: 'sweeps', obj_mode: 'extend'});
    //$('#scale-overlay>img').attr('src', scalePath()+'SWEEPS.png');
};

var switch2zsweeps = function() {
    model_player_stop();
    // $('#model').val('zsweeps');
    $('#legends_visibility').attr('data','');
    refreshDropdowns(3, null, {model: 'zsweeps', obj_mode: 'extend'});
    //$('#scale-overlay>img').attr('src', scalePath()+'ZSWEEPS.png');
};

var switch2tracking = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('storms');
    refreshDropdowns(2, null, {model: 'storms', obj_mode: 'extend'});
};

var switch2floods = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('floods');
    refreshDropdowns(2, null, {model: 'floods', obj_mode: 'extend'});
};

var switch2regen = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('regen');
    refreshDropdowns(3, 264, {model: 'regen', obj_mode: 'extend'});
};

var switch2radarlight = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('pl');
    refreshDropdowns(2, null, {model: 'pl', obj_mode: 'extend'});
};

var switch2lightnings  = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('blitze');
    $('#legends_visibility').attr('data','')
    refreshDropdowns(2, null, {model: 'blitze', obj_mode: 'extend'});
};

var switch2lightningsWorld  = function() {
    model_player_stop(); setLastParamId();
    // $('#model').val('blitze');
    $('#legends_visibility').attr('data','')
    refreshDropdowns(2, null, {model: 'weltblitze', obj_mode: 'extend'});
};

var switchobsraw = function(model) {
    model_player_stop();
    // $('#model').val(model);
    $('#legends_visibility').attr('data','')
    refreshDropdowns(null, null, {model: model, obj_mode: 'extend'});
};

var switch2obs = function() { switchobsraw('obs'); };
var switch2obsama = function() { switchobsraw('obsama'); };
var switch2obsclimall = function() { switchobsraw('obsclimall'); };
var switch2obs3at = function() { switchobsraw('obs3at'); };
var switch2obsair = function() { switchobsraw('obsair'); };
var switch2obslev3 = function() { switchobsraw('obslev3'); };
var switch2obspfkm = function() { switchobsraw('obspfkm'); };
var switch2obsradio = function() { switchobsraw('obsradio'); };
var switch2gma = function() { switchobsraw('gma'); };

var switch2pollen = function() {
    model_player_stop();
    // $('#model').val('pollen');
    $('#legends_visibility').attr('data','')
    refreshDropdowns(2, null, {model: 'pollen', obj_mode: 'extend'});
};

var switch2radarus = function(param) {
    model_player_stop();
    // $('#model').val('radarus');
    $('#legends_visibility').attr('data','')
    if (parseInt(param)>0) {
        refreshDropdowns(false, param, {model: 'radarus', obj_mode: 'extend'});
    }
    else {
        refreshDropdowns(2, null, {model: 'radarus', obj_mode: 'extend'});
    }
};

var switch2radial = function(standort) {
    model_player_stop(); setLastParamId();
    if (standort && standort === 'b') {
        standort = 80;
    }
    else {
        standort = 79;
    }
    // $('#model').val('radial');
    $('#legends_visibility').attr('data','')
    refreshDropdowns(false, standort, {model: 'radial', obj_mode: 'extend'});
    //$('#scale-overlay>img').attr('src', scalePath()+'RADIAL.png');
};

var switch2sat = function() {
    switch2sat_raw(131);
};

var switch2sat15 = function() {
    switch2sat_raw(132);
};

var switch2sat_raw = function(id) {
    if (last_param_id > 0) {
        id = last_param_id;
    }
    //closeMarker();
    model_player_stop();
    // $('#model').val('sat');
    $('#legends_visibility').attr('data','')
    refreshDropdowns(false, id, {model: 'sat', obj_mode: 'extend'});
};

var checkHash = function() {
  var hash = window.location.hash;
  var flag_player = ($('#player-flag').attr('data-value') === 'true' ? true : false);
  if (hash.substr(0,4) == '#geo') {
      var data = hash.replace("#","").split(/_/,3);
      $.post(get_url_path()+'/ajax/geoxy', {
            'area_id' : get_selected_area(),
            'lat' : data[1],
            'long' : data[2]
            }, function (data) {
                if (typeof data.x !== 'undefined' && typeof data.y !== 'undefined' &&
                        parseInt(data.x)>=0 && parseInt(data.x)<=760 && 
                        parseInt(data.y)>=0 && parseInt(data.y)<=616) {
                    // Geolocation
                    $('#geo-x').val(parseInt(data.x));
                    $('#geo-y').val(parseInt(data.y));
                    $('#geo-lat').val(data.lat);
                    $('#geo-long').val(data.long);
                    place_obs();
                }
          },'json');
  }
  else if (hash.indexOf('#play') !== -1 && flag_player) {
    var playOptions = hash.split('-');
    var start = playOptions.length > 1 && parseInt(playOptions[1]) || player_range_value[0];
    var end = playOptions.length > 2 && parseInt(playOptions[2]) || player_range_value[1];
    var speed = playOptions.length > 3 && parseInt(playOptions[3]) || images_speed;

    start = start < 0 ? 0 : start;
    start = start > player_range_end ? player_range_end : start;

    end = end < 0 ? 0 : end;
    end = end > player_range_end ? player_range_end : end;

    speed = speed < 0 ? 0 : speed;
    speed = speed >= images_delay.length ? images_delay.length - 1 : speed;

    block_hiding_loadinglayer_when_loading = true;

    if((isModelCard($('#model').val()) || isReanalyseModel($('#model').val())) && $('#model-player-interval').length) {
        var interval = $('#model-player-interval').val();
        if(playOptions.length > 4 && parseInt(playOptions[4]) && $('#model-player-interval option[value="'+playOptions[4]+'"]').length) {
            interval = playOptions[4];
        }
        $('#model-player-interval').val(interval).trigger('change');
        //player_range_value = [start, end];
        images_speed = speed;
        $('#player-range-slider').bootstrapSlider('setValue', [start, end], true, true);
        $('#sld_model_player_speed').bootstrapSlider('setValue', images_speed);
        modelcharts_player_start(1);
    } else if(modelWithPlayer($('#model').val())) {
        // player_range_value = [start, end];
        images_speed = speed;
        $('#player-range-slider').bootstrapSlider('setValue', [start, end], true, true);
        $('#sld_model_player_speed').bootstrapSlider('setValue', images_speed);
        model_player_start(1);
    }

  }
  else if (hash == '#play' && isModelCard($('#model').val()) && flag_player) {
    block_hiding_loadinglayer_when_loading = true;
    modelcharts_player_start(1);
  }
  else if (hash == '#play' && modelWithPlayer($('#model').val()) && flag_player) {
    block_hiding_loadinglayer_when_loading = true;
    model_player_start(1);
  }
  else if (hash == '#play2' && modelWithPlayer($('#model').val()) && flag_player) {
    block_hiding_loadinglayer_when_loading = true;
    trackPlayer('#radar-animation', '24');
    model_player_extend_level(2);
  }
  else if (hash == '#play4' && modelWithPlayer($('#model').val()) && flag_player) {
    block_hiding_loadinglayer_when_loading = true;
    trackPlayer('#radar-animation', '48');
    model_player_extend_level(4);
  }
  else if (hash == '#play6' && modelWithPlayer($('#model').val()) && flag_player) {
    block_hiding_loadinglayer_when_loading = true;
    trackPlayer('#radar-animation', '72');
    model_player_extend_level(6);
  }
  else if (hash == '#play8' && modelWithPlayer($('#model').val()) && flag_player) {
    block_hiding_loadinglayer_when_loading = true;
    trackPlayer('#radar-animation', '96');
    model_player_extend_level(8);
  }
  else if (hash == '#locateme') {
      gps_locating_wetter();
  }
  else if (hash.indexOf('#sounding-') !== -1) {
    if ($('.btn-progsound').html() !== undefined && !$('.btn-progsound').hasClass('btn-invisible')) {
        var params = decodeURIComponent(hash.substring('#sounding-'.length));
        const regex = /^x(\d{1,3})y(\d{1,3})$/;
        if(regex.test(params)) {
            var matches = params.match(regex);
            if (typeof matches[1] !== undefined && typeof matches[2] !== undefined &&
                    parseInt(matches[1])>=0 && parseInt(matches[1]) <=620 &&
                    parseInt(matches[2])>=0 && parseInt(matches[2]) <=760
                    ) {
                toggleProgSoundings();
                progsounding(matches[1],matches[2]);
            }
        }
    }
  }
  else if (hash == '#trajectory-info') {
      showFAQ('trajectory-info');
      $('#faq-modal').modal('show');
      toggleTrajectories();
  }
  else if (hash.indexOf('#trajectory-') !== -1) {
    if ($('.btn-trajectory').html() !== undefined && !$('.btn-trajectory').hasClass('btn-invisible')) {
        var params = decodeURIComponent(hash.substring('#trajectory-'.length));
        const regex = /^x(\d{1,3})y(\d{1,3})$/;
        if(regex.test(params)) {
            var matches = params.match(regex);
            if (typeof matches[1] !== undefined && typeof matches[2] !== undefined &&
                    parseInt(matches[1])>=0 && parseInt(matches[1]) <=620 &&
                    parseInt(matches[2])>=0 && parseInt(matches[2]) <=760
                    ) {
                toggleTrajectories();
                showTrajectory(matches[1],matches[2]);
            }
        }
    }
  }
  else if (hash.indexOf('#obs-detail-') !== -1) {
    var params = decodeURIComponent(hash.substring('#obs-detail-'.length));
    var id = null;
    var timepsanHours = null;

    const regex = /^(.+?)(?:-(\d{1,2})h){0,1}$/;
    if(regex.test(params)) {
        var matches = params.match(regex);

        if(typeof matches[1] !== undefined) {
            id = matches[1];
        }

        if(typeof matches[2] !== undefined) {
            timepsanHours = matches[2];
        }
    }

    var param = null;

    if(id.indexOf(',') !== -1) {
        var parts = id.split(',');
        id = parts[0];
        param = parts[1];
    }

    if(typeof id !== 'undefined' && id != '') {
        var link = getLinkElement(id);

        if(param !== null)
            link.attr('data-param', param);
        else
            link.removeAttr('data-param');

        if(timepsanHours !== null)
            link.attr('data-timespan', timepsanHours);
        else
            link.removeAttr('data-timespan');

        if(link.length != 0) {
            setTimeout(function() {
                doPI=false;
                link.trigger('click');
                link.removeAttr('data-param');
                link.removeAttr('data-timespan');
            }, 200);
            
        }
    }
}
};

var focus_search = function() {
    $('#forecast-input-0').focus();
};

var focus_search0 = function() {
    $('#forecast-input-0').focus();
};

var focus_search1 = function() {
    $('#forecast-input-1').focus();
};

var focus_search8 = function() {
    $('#forecast-input-8').focus();
};

var sharePopover = function() {
    var popover = $('.sharer-toggle').popover({
        html: true,
        trigger: 'click',
        placement: 'bottom',
        container: '#main-image-content',
        content: function() {
            return $(".sharer-popover-content").html();
        },
        // viewport: { selector: '#main-image-content', padding: 4 }
    });

    if(typeof popover.data('bs.popover') !== 'undefined') {
        popover.data('bs.popover')
        .tip()
        .addClass('share-popover');

        refreshShareURL();

        if(!navigator.share) {
            $('.sharer-popover-content .share-brands .btn-navigator-share').hide();
        }

        popover.off('shown.bs.popover').on('shown.bs.popover', function () {
            $('[data-toggle="tooltip"]').tooltip();
            $('.share-popover .share-url-settings .btn').off('click').on('click', function() {
                var btnClickedVal = $(this).attr('data-value');
                var settingsGroup = $(this).closest('.share-url-settings');

                if(settingsGroup.hasClass('default-models')) {
                    $('.sharer-settings .share-url-settings.default-models .btn').removeClass('btn-active').addClass('btn-inactive');
                    $('.sharer-settings .share-url-settings.default-models .btn[data-value="'+btnClickedVal+'"]').removeClass('btn-inactive').addClass('btn-active');
                } else if(settingsGroup.hasClass('forecast-models')) {
                    $('.sharer-settings .share-url-settings.forecast-models .btn').removeClass('btn-active').addClass('btn-inactive');
                    $('.sharer-settings .share-url-settings.forecast-models .btn[data-value="'+btnClickedVal+'"]').removeClass('btn-inactive').addClass('btn-active');
                } else {
                    var model = settingsGroup.attr('data-model');
                    $('.sharer-settings .share-url-settings.specific-model[data-model="'+model+'"] .btn').removeClass('btn-active').addClass('btn-inactive');
                    $('.sharer-settings .share-url-settings.specific-model[data-model="'+model+'"] .btn[data-value="'+btnClickedVal+'"]').removeClass('btn-inactive').addClass('btn-active');
                }
                refreshShareURL();
            });

            $('.share-popover .share-popover-url').off('click focus').on('click focus', function() {
                $(this).select();
            });

            var copiedTimeout = null;
            $('.share-popover .share-popover-url-copy').off('click').on('click', function() {
                var urlEl = $('.share-popover .share-popover-url');
                // urlEl.focus();
                if(urlEl.length) {
                    urlEl[0].select();
                    urlEl[0].setSelectionRange(0, 99999); 
                }

                document.execCommand("copy");

                $('.share-popover .share-popover-url-copy, .share-popover .share-popover-url').addClass('copied');

                clearTimeout(copiedTimeout);
                setTimeout(function() {
                    $('.share-popover .share-popover-url-copy, .share-popover .share-popover-url').removeClass('copied');
                }, 1000);
            });

            $('.share-popover .share-brands .btn').off('click').on('click', function() {
                var brand = $(this).attr('data-to');

                if(brand === 'navigator-share') {
                    if(navigator.share && typeof navigator.share === 'function') {
                        var url = refreshShareURL();
                        var data = {
                            url: url,
                            title: document.title,
                        };

                        navigator.share(data).then().catch(function(error) {
                            // console.log(error)
                        });

                        // Zukünfitg für das Teilen von den Images über die Web Share API
                        // if(fetch && typeof fetch === 'function') {
                        //     console.log('Before retrieving file.');
                        //     var dlUrl = get_download_image_path(null, null, true);
                        //     // if(dlUrl.indexOf('http') !== 0) dlUrl = 'https://kachelmannwetter.com' + dlUrl;
                        //     console.log(dlUrl);
                        //     fetch(dlUrl, {credentials: 'include'}).then(function(response) {
                        //             if(!response.ok) throw Error('Failed fetch');
                        //             console.log(response);
                        //             return response.blob();
                        //         }).then(function(blob) {
                        //             console.log(blob);
                        //             var file = new File([blob], "picture.png", {type: blob.type});
                        //             var filesArray = [file];

                        //             data.files = filesArray;
                        //         }).finally(function() {
                        //             console.log(data);
                        //             navigator.share(data);
                        //         });
                        // } else {
                        //     console.log(data);
                        //     navigator.share(data);
                        // }
                    }

                    return;
                }

                var share_url = '';
                var window_name = '_kw';
                var features = 'width=600, height=480';
                switch (brand) {
                    case 'facebook':
                        share_url = 'https://www.facebook.com/sharer/sharer.php?u=';
                        window_name = '_kwFacebook';
                        break;
                    case 'twitter':
                        share_url = 'https://twitter.com/share?url=';
                        window_name = '_kwTwitter';
                        features = 'width=600, height=640';
                        break;
                    case 'whatsapp':
                        share_url = 'https://wa.me/?text=';
                        window_name = '_kwWhatsapp';
                        break;
                    default:
                        break;
                }

                var url = refreshShareURL();

                share_url = share_url + encodeURIComponent(url)

                window.open(share_url,window_name,features);
                
            });

            $('.share-popover .btn-image-dl').off('click').on('click', function() { save_as(); });

            refreshShareURL();
        });

    }

}

var gotoTraj = function() {
    var url = $('#trajinf').attr('href');
    var url_curr = document.location.href;
    if (typeof url !== 'undefined' && url.length > 10 && typeof url_curr !== 'undefined' ) {
        var url_arr = url.split("#");
        var url_curr_arr = url_curr.split("#");
        document.location.href = url;
        if (typeof url_arr[0] !== 'undefined' && typeof url_curr_arr[0] !== 'undefined' &&
               url_arr[0] === url_curr_arr[0] ) {
            showFAQ('trajectory-info');
            $('#faq-modal').modal('show');
        }
    }
}
var refreshShareURL = function(history_mode) {

    refreshShareButtons(history_mode);
    var model = $('#model').val();

    var element = '.share-popover';
    if(!$(element).length) {
        element = '.sharer-popover-content';
    }

    var urlSettingsButtonGroups = $(element + ' .sharer-settings .share-url-settings');
    
    var modelShareButtons = urlSettingsButtonGroups.filter('.specific-model[data-model~="' + $('#model').val() + '"]');
    if(!modelShareButtons.length && isModelCard(model)) modelShareButtons = $(element + ' .sharer-settings .share-url-settings.forecast-models');
    if(!modelShareButtons.length) modelShareButtons = $(element + ' .sharer-settings .share-url-settings.default-models');

    var urlSetting = modelShareButtons.find('.btn-active').attr('data-value') || 'date';
    
    var completeUrl = directURL();

    var hash = window.location.hash;
    var is_animation = is_playing || is_preloading || history_mode == 1;
    if(isModelCard(model) && getFlagPlayer() && is_animation) {
        var model_run = $('#model-run').val() || '';
        if(model_run != '') {
            urlSetting = 'recent';
        }
    }

    var newUrl = completeUrl;

    if(urlSetting == 'date' || model == 'radarpre') {
        newUrl = completeUrl + hash;
        $('.sharer-settings .share-popover-url').attr('value', newUrl);
    }
    else if(urlSetting == 'recent') {
        var urlParts = completeUrl.split('/');
        var lastIndex = urlParts.length - 1;

        var file = $('#share-file').val();

        if(!urlParts[lastIndex])
            lastIndex -= 1;

        var posOfLastPart = completeUrl.indexOf('/' + urlParts[lastIndex]);
        newUrl = completeUrl.substring(0, posOfLastPart);

        let model_source = $('#model-source').val() || $('#area-source').val();

        if (model == 'cyclone') {
            var filter = $('#model-filter-storm').val();
            if (filter) {
                newUrl = newUrl + '/' + $('#model-filter-storm').val();
            }
        }
        else if (model === 'radarus' && radarus_is_dyn()) {
            newUrl = newUrl + '/' + $('#model-location').val();
        } 
        else if(typeof model_source !== 'undefined' && model_source != '') {
            file = 'src' + model_source;
            newUrl = newUrl + '/' + file;
        }

        // console.log({file, model, newUrl});

        if(!file && model != 'cyclone') {
            newUrl = newUrl + '/';
        } else {
            newUrl = newUrl + '.html';
        }

        newUrl = newUrl + hash;

        $('.sharer-settings .share-popover-url').attr('value', newUrl);
    }

    if($('.share-popover .share-popover-url').length) {
        $('.share-popover .share-popover-url')[0].scrollLeft = $('.share-popover .share-popover-url')[0].scrollWidth;
    }

    return newUrl;

}

var refreshShareButtons = function(history_mode) {

    var model = $('#model').val();

    var urlSettingsButtonGroups = $('.sharer-settings .share-url-settings');
    urlSettingsButtonGroups.addClass('hide');
    
    var modelShareButtons = urlSettingsButtonGroups.filter('.specific-model[data-model~="' + model + '"]');
    if(!modelShareButtons.length && isModelCard(model)) modelShareButtons = urlSettingsButtonGroups.filter('.forecast-models');
    if(!modelShareButtons.length) modelShareButtons = $('.sharer-settings .share-url-settings.default-models');
    modelShareButtons.removeClass('hide');

    var buttons = modelShareButtons.find('.btn')
    buttons.attr('disabled', false);

    var is_animation = is_playing || is_preloading || history_mode == 1;

    if(isModelCard(model) && getFlagPlayer() && is_animation) {
        var model_run = $('#model-run').val() || '';
        if(model_run != '') {
            buttons.filter('.btn[data-value="recent"]').attr('disabled', true).removeClass('btn-active').addClass('btn-inactive');
            buttons.filter('.btn[data-value="date"]').removeClass('btn-inactive').addClass('btn-active');
        } else {
            buttons.filter('.btn[data-value="date"]').attr('disabled', true).removeClass('btn-active').addClass('btn-inactive');
            buttons.filter('.btn[data-value="recent"]').removeClass('btn-inactive').addClass('btn-active');
        }
    }

    buttons.each(function() {
        var text = $(this).attr('data-text');
        if($(this).parent().hasClass('forecast-models') && isModelCard(model) && $('#model-run').val()) {
            text = $(this).attr('data-modelrun-text');
        }
        if(is_animation) {
            text = $(this).attr('data-animation-text');

            if(modelWithPlayer(model) && getFlagPlayer() && $(this).attr('data-value') == 'date') {
                $(this).attr('disabled', true);
                $(this).removeClass('btn-active').addClass('btn-inactive');
                buttons.filter('.btn[data-value="recent"]').removeClass('btn-inactive').addClass('btn-active');
            }
        }
        $(this).html(text);
    });



}



var shareWhatsapp = function(blitz, station) {
    document.location.href = 'https://wa.me/?text='+encodeURIComponent(directURL(blitz, station));
};

var shareCanonicalFB = function() {
    return shareForecast('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent($('link[rel=canonical]').attr('href')), '_kwFacebook');
};

var shareCanonicalTwitter = function() {
    return shareForecast('https://twitter.com/share?url='+encodeURIComponent($('link[rel=canonical]').attr('href')), '_kwTwitter');
};

var shareForecastFB = function(tab) {
    var url = $('#forecast-url').attr('data');
    var tab2 = $('#tab-url').attr('data-src');
    if ($('#weather-fcxl-page').attr('data-m') === 'swissmos' || $('#weather-fcxl-page').attr('data-m') === 'deu-mos' || $('#weather-fcxl-page').attr('data-m') === 'srb') {        
        var mos_station_id = $('#weather-fcxl-page').attr('data-mos-id');
        if (mos_station_id !== '' && typeof mos_station_id !== 'undefined') { 
            url+='_'+mos_station_id;
        }
    } 
if (typeof tab !== 'undefined' && tab.length) {
        url = url + '/' + tab;
    }
    else if (typeof tab2 !== 'undefined' && tab2.length) {
        url = url + '/' + tab2;
    }
    return shareForecast('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url), '_kwFacebook');
};

var shareForecastTwitterPlain = function() {
    var url = $('#forecast-url').attr('data');
    if($('#weather-ensemble-page').length) {
        url = forecastModelEnsemble(2);
    }
    return shareForecast('https://twitter.com/share?url='+encodeURIComponent(url), '_kwTwitter');
};

var shareForecastFBPlain = function() {
    var url = $('#forecast-url').attr('data');
    if($('#weather-ensemble-page').length) {
        url = forecastModelEnsemble(2);
    }
    return shareForecast('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url), '_kwFacebook');
};

var shareForecastTwitter = function(tab) {
    var url = $('#forecast-url').attr('data');
    var tab2 = $('#tab-url').attr('data-src');
    if ($('#weather-fcxl-page').attr('data-m') === 'swissmos' || $('#weather-fcxl-page').attr('data-m') === 'deu-mos' || $('#weather-fcxl-page').attr('data-m') === 'srb') {        
        var mos_station_id = $('#weather-fcxl-page').attr('data-mos-id');
        if (mos_station_id !== '' && typeof mos_station_id !== 'undefined') { 
            url+='_'+mos_station_id;
        }
    } 
    if (typeof tab !== 'undefined' && tab.length) {
        url = url + '/' + tab;
    }
    else if (typeof tab2 !== 'undefined' && tab2.length) {
        url = url + '/' + tab2;
    }
    return shareForecast('https://twitter.com/share?url='+encodeURIComponent(url), '_kwTwitter');
};

var shareForecast = function(url, windowname) {
    if (url) {
        window.open(url,windowname,'width=600, height=300');
    }
    return false;
}

var shareFB = function(blitz, station) {
    return shareURL('https://www.facebook.com/sharer/sharer.php?u=','_kwFacebook',blitz);
};

var shareTwitter = function(blitz, station) {
    return shareURL('https://twitter.com/share?url=','_kwTwitter',blitz, station);
};

var shareNative = function(blitz, station) {
    completeurl = directURL(blitz, station);
    var hash = window.location.hash;
    var hash_url = completeurl;
    if (hash.indexOf('#play') !== -1 || hash.indexOf('obs-detail') !== -1 || hash.indexOf('sounding') !== -1 || hash.indexOf('trajectory') !== -1) {
        hash_url = window.location.href;
    }

    if(navigator.share && typeof navigator.share === 'function') {
        var data = {
            url: hash_url,
            title: document.title,
        };

        navigator.share(data).then().catch(function(error) {
            // console.log(error)
        });
    }
};

var copyToClipboard = function(blitz, station) {
    console.log(directURL(blitz, station));
};

var directURL = function(blitz, station) {
    var url = $('#share-path').val();
    if (!url) {
        url = '';
    }
    var file = $('#share-file').val();
    if (file && file.length && !url.endsWith(file + '/')) {
        file = file+"/";
    }
    else {
        file = '';
    }
    return addHash2Url(url+file,blitz, station);
};

var shareURL = function(share_url, window_name, blitz, station) {
    completeurl = directURL(blitz, station);
    var hash = window.location.hash;
    var hash_url = completeurl;
    if (hash.indexOf('#play') !== -1 || hash.indexOf('obs-detail') !== -1 || hash.indexOf('sounding') !== -1 || hash.indexOf('trajectory') !== -1) {
        hash_url = window.location.href;
    }
    if ($('#model').val().length) {
        window.open(share_url+encodeURIComponent(hash_url),window_name,'width=600, height=300');
    }
    else {
        window.open(share_url+encodeURIComponent(hash_url),window_name,'width=600, height=300');
    }
    return false;
};

var addHash2Url = function(url,blitz, station) {
    var timeurl = '';
    var day = $('#model-valid').val();
    if ($('#model').val() == 'cyclone') {
        timeurl = $('#model-run').val();
        if (day) {
            timeurl = timeurl+'-'+day;
        }
        var filter = $('#model-filter-storm').val();
        if (filter) {
            timeurl = timeurl+'-'+filter;
        }
        timeurl = timeurl+'.html';
    }
    else if (day) {
        day = day.replace(/-/g,'');
        day = day.replace(/:/g,'');
        day = day.replace("/","-");
        timeurl = day;
        if ($('#model').val() == 'radarpre') {
            timeurl = '';
        }
        if ($('#model').val() === 'radarus' && radarus_is_dyn()) {
            timeurl = $('#model-location').val()+'_'+timeurl;
        }
        if (timeurl.length || isObsMode($('#model').val())) {
            timeurl = timeurl+'z';
            var blitz_id = $('#blitz-id-modal').attr("data");
            var is_5min_only = $('#blitze-5minonly').prop('checked');
            var track_url = $('#track-url').attr("data");
            var flood_url = $('#flood-url').attr("data");
            var model_source = $('#model-source').val() || $('#area-source').val();

            if($('#model').val() === 'blitze' || $('#model').val() === 'weltblitze') {
                if(is_5min_only) {
                    if ($('#model').val() === 'blitze') {
                        timeurl += '-' + lightning_url_values[lightning_filter_value];
                        timeurl += '-5min';
                    }
                    else {
                        timeurl += '-a-5min';
                    }
                } else {
                    if ($('#model').val() === 'blitze') {
                        if(lightning_filter_value !== 0 && lightning_url_values[lightning_filter_value]) {
                            timeurl += '-' + lightning_url_values[lightning_filter_value];
                        }
                    }
                }
            }

            if (blitz === 1 && blitz_id) {
                 timeurl = timeurl +'-' +blitz_id;
            }
            else if (blitz === 3 && track_url) {
                timeurl = track_url;
            }
            else if (blitz === 4 && flood_url) {
                timeurl = flood_url;
            }
            else if (typeof model_source !== 'undefined' && model_source) {
                timeurl = timeurl + '_src'+model_source;
            }
            timeurl = timeurl +'.html';
        }
    }
    else {
        day = $('#model-run').val();
        if (day) {
            timeurl = day;
            if (timeurl.length) {
                if (station) {
                    timeurl =  station + '-' + timeurl;
                }
                timeurl = timeurl +'.html';
            }
        }
    }
    
    var hash = window.location.hash;
    var hash_url = '';
    if (hash.substr(0,4) == '#geo') {
        hash_url = hash;
    }
    return url+timeurl+hash_url;
};

var showLgt = function(blitzid,counter) {
    $('#blitzortung').off('hide.bs.modal').on('hide.bs.modal', function(e) {
        addHistory(2);
    });

    $('#map-wrapper').hide();
    $('#map-ajax-loader').show();
    var c = true;
    if (counter === false) {
        c = false;
    }
    $.get(get_url_path()+'/ajax/blitzortung', {
            'blitz_id' : blitzid,
            'counter' : c,
            'lang' : displayLanguage(),
            'area_id' : get_selected_area(),
            'blitz_filter' : lightning_filter_value,
            }, function (data) {
                $('#map-ajax-loader').hide();
                $('#map-wrapper').show();
                $('#map-wrapper').html(data);
                if (c) { addHistory(2, 1); } 
          },'html');
};

var showWLgt = function(blitzid,counter) {
    $('#blitzortung').off('hide.bs.modal').on('hide.bs.modal', function(e) {
        addHistory(2);
    });

    $('#map-wrapper').hide();
    $('#map-ajax-loader').show();
    var c = true;
    if (counter === false) {
        c = false;
    }
    $.get(get_url_path()+'/ajax/weltblitzortung', {
            'blitz_id' : blitzid,
            'counter' : c,
            'lang' : displayLanguage(),
            'area_id' : get_selected_area(),
            }, function (data) {
                $('#map-ajax-loader').hide();
                $('#map-wrapper').show();
                $('#map-wrapper').html(data);
                if (c) { addHistory(2, 1); }
          },'html');
};

var showPollen = function(pollen,counter) {
    $('#pollen-detail').modal('show');
    pollen_detail(pollen,counter);
};


var obs_detail = function (value, station, timestamp, id) {

    $('#obs-detail').off('hide.bs.modal').on('hide.bs.modal', function(e) {
        $('#obs-detail').attr('data-station-id', '');
        addHistory(5);
    });

    if(typeof id !== 'undefined' && id !== null) {
        $('#obs-detail').attr('data-station-id', id);
        addHistory(4);
    }

    $('#obs-detail-label').html(station);
    $('#obs-detail-wrapper>h1').html(value);
    $('#obs-detail-wrapper>p>span').html(timestamp);
    return false;
};
var obs_detail_3h = function (value, station, timestamp, id, timestamp2, counter, param) {

    $('#obs-detail-3h').off('hide.bs.modal').on('hide.bs.modal', function(e) {
        $('#obs-detail-3h').attr('data-station-id', '');
        $('#obs-detail-3h').attr('data-param-id', '');
        $('#obs-detail-3h').attr('data-timespan', '');
        addHistory(5);
    });

    var link = getLinkElement(id);

    if(typeof param === 'undefined') {
        if(link.length && link.attr('data-param')) {
            param = link.attr('data-param');

            $('#obs-detail-3h-table button.change-graph').removeClass('btn-active').addClass('btn-primary');
            $('#obs-detail-3h-table button.change-graph[data-value="'+param+'"]').addClass('btn-loading');
        }
    }

    var timespan = null;
    if(link.length && link.attr('data-timespan')) {
        timespan = link.attr('data-timespan');
    }

    if(id !== null) {
        $('#obs-detail-3h').attr('data-station-id', id);
        
        if(param)
            $('#obs-detail-3h').attr('data-param-id', param);

        if(timespan)
            $('#obs-detail-3h').attr('data-timespan', timespan);

        addHistory(4);
    }

    if(!param) {
        param = $('#model-param').val();
    }

    var prevChart = $('#hc_obs_graph').highcharts();

    if(!$('#obs-detail-3h').is(':visible')) {
        $('#obs-detail-3h-table').html('');
    } else {
        $('#obs-detail-3h-table > :not(:first-child)').css('opacity', .5);
    }

    $('#obs-detail-3h-label').html(station);
    $('#obs-detail-3h-js>h1').html(value);
    $('#obs-detail-3h-js>p>span').html(timestamp);
    var c = true;
    if (counter === false) {
        c = false;
    }
    // Verhinderung doppelter Zählung bei Aufruf mit Hash und automatischem Ajax-Layer
    if (doPI === false) {
        c = false;
    }
    doPI=true;
    var model = $('#model').val();

    $.get(get_url_path()+'/ajax/obsdetail', {
            'station_id' : id,
            'timestamp' : timestamp2,
            'param_id' : param,
            'model' : model,
            'area_id' : get_selected_area(),
            'counter' : c,
            'lang' : displayLanguage(),
            }, function (data) {
                if(typeof prevChart == 'object') {
                    clearInterval(hc_drawn_intervall_handle);
                    clearInterval(vectorAnimationHandle);
                    prevChart.destroy();
                    hc_obs_series = undefined;
                }

                if (data === 'NOT_ALLOWED') {
                    messageLayer(403,'#error-msg','#error-modal');
                }
                else if (data === 'TOO_MANY_REQUESTS') {
                    messageLayer(429,'#error-msg','#error-modal');
                }
                else if (data !== 'FALSE') {
                    if (model === 'obsradio') { $('#obs-detail-3h-js').hide(); } else { $('#obs-detail-3h-js').show(); }
                    $('#obs-detail-3h-table').html(data);
                    setTimeout(function() {
                            if ($('#obs-detail-3h-table>table>tbody>tr:first>td:last').length) {
                                var value = $('#obs-detail-3h-table>table>tbody>tr:first>td:first').html();
                                if (typeof value !== 'undefined') {
                                    value = value.replace(/(.*)([0-2][0-9]:[0-5][0-9])(.*)/, function(match, p1, p2, p3, offset, string){
                                        return p2;
                                    });
                                    $('#obs-detail-3h-js>h1').html($('#obs-detail-3h-table>table>tbody>tr:first>td:last').html());
                                    $('#obs-detail-3h-js>p>span').html(value);
                                }
                            }
                        },10);
                    setTimeout(function() { $('#obs-detail-3h-table > :not(:first-child)').css('opacity', 1); }, 1);
                    draw_obs_graph();
                    // Lazy loading for skewt-diagram
                    if (model === 'obsradio') {
                        setTimeout(function() { 
                            $(".skewtbox>img").unveil(0
                                , function() {
                                    $(this).load(function() {
                                        $(this).removeClass('skewtloader');
                                        $(this).addClass('skewtdiagram');
                                        $('#skewtloadertxt').hide();
                                    });
                                })}, 200);
                        }

                    if($('#obs-detail-3h-table button.change-graph').length) {
                        $('#obs-detail-3h-table button.change-graph').on('click', function() {
                            $('#obs-detail-3h-table button.change-graph').removeClass('btn-active').addClass('btn-primary');
                            $(this).addClass('btn-loading')
                            var btnParam = $(this).attr('data-value');
                            obs_detail_3h(value, station, timestamp, id, timestamp2, false, btnParam);
                        });
                    }

                    if($('#obs-detail-3h-table button.timespan-button').length) {

                        if(timespan !== null && $('#obs-detail-3h-table button.timespan-button[data-value='+timespan+']').length) {
                            $('#obs-detail-3h-table button.timespan-button').removeClass('btn-active').addClass('btn-primary');
                            $('#obs-detail-3h-table button.timespan-button[data-value='+timespan+']').removeClass('btn-primary').addClass('btn-active');
                        }

                        $('#obs-detail-3h-table button.timespan-button').on('click', function() {
                            $('#obs-detail-3h-table button.timespan-button').removeClass('btn-active').addClass('btn-primary');
                            $(this).removeClass('btn-primary').addClass('btn-active');
                            var selectedHour = +$(this).attr('data-value');
                            $('#hc_obs_graph').highcharts().xAxis[0].setExtremes(hc_obs_max - selectedHour * 36e5, null, false, false);
                            // $('#hc_obs_graph').highcharts().update({
                            //     xAxis: {
                            //         min: hc_obs_max - selectedHour * 36e5
                            //     }
                            // }, true, false, false);
                            $('#obs-detail-3h').attr('data-timespan', selectedHour);
                            addHistory(4, 'replace');
                            
                            if(typeof hc_is_accumulated !== 'undefined' && hc_is_accumulated) {
                                $('#hc_obs_graph').highcharts().series[1].setData(obs_calculate_accumulated());
                            }
                            
                            $('#hc_obs_graph').highcharts().redraw(true);

                        });
                    }

                } else if(data === 'FALSE') {
                    if($('#obs-detail-3h-table .button-tab-bar').length) {
                        $('#obs-detail-3h-table').html($('#obs-detail-3h-table .button-tab-bar'));
                        $('#obs-detail-3h-table button.change-graph').removeClass('btn-active').addClass('btn-primary');
                        $('#obs-detail-3h-table button.change-graph.btn-loading').removeClass('btn-loading btn-primary').addClass('btn-active');
                        $('#obs-detail-3h-table button.change-graph').off('click').on('click', function() {
                            $('#obs-detail-3h-table button.change-graph').removeClass('btn-active').addClass('btn-primary');
                            $(this).addClass('btn-loading')
                            var btnParam = $(this).attr('data-value');
                            obs_detail_3h(value, station, timestamp, id, timestamp2, false, btnParam);
                        });
                    } 
                    setTimeout(function() { $('#obs-detail-3h-table > :not(:first-child)').css('opacity', 1); }, 1);
                }
          },'html');
};

var progsounding = function (posX, posY) {
    if(posX !== null && posY !== null) {
        var completeurl = location.href;
        var ohne_hash = completeurl.split("#");
        completeurl = ohne_hash[0]+'#sounding-'+ 'x'+posX+'y'+posY;
        pushHistory(completeurl);
    }
    var selected_index = $('#model-valid').prop("selectedIndex");
    if(selected_index > $('#model-valid-hidden option').length - 1) { selected_index = $('#model-valid-hidden option').length - 1; }
    $('#model-valid-hidden').prop("selectedIndex", selected_index);
    var model_valid_hidden = $('#model-valid-hidden').val();
    var run_date = model_valid_hidden.split('#');
    $('#obs-detail-3h-table').html('');
    $('#obs-detail-3h-label').html('&nbsp;');
    $('#obs-detail-3h-js').hide(); 
    var model = $('#model').val();
    $.get(get_url_path()+'/ajax/progsounding', {
            'posX' : posX,
            'posY' : posY,
            'area_id' : get_selected_area(),
            'model_run' : run_date[0],
            'valid' : run_date[1],
            'model' : model,
            'lang' : displayLanguage()
            }, function (data) {
                if (data === 'NOT_ALLOWED') {
                    messageLayer(403,'#error-msg','#error-modal');
                }
                else if (data === 'TOO_MANY_REQUESTS') {
                    messageLayer(429,'#error-msg','#error-modal');
                }
                else if (data !== 'FALSE') {
                    $('#obs-detail-3h-table').html(data);
                    setTimeout(function() { $('#obs-detail-3h-table > :not(:first-child)').css('opacity', 1); }, 1);
                    $('#obs-detail-3h').modal('show');
                    // Lazy loading for skewt-diagram
                    setTimeout(function() { 
                        $('#obs-detail-3h-label').html($('#psound-h2').html());
                        $(".skewtbox>img").unveil(0
                            , function() {
                                $(this).load(function() {
                                    $(this).removeClass('skewtloader');
                                    $(this).addClass('skewtdiagram');
                                    $('#skewtloadertxt').hide();
                                });
                            })}, 200);
                }
          },'html');
};

var traj_script_loaded = false;
var showTrajectory = function (posX, posY) {
    if(posX !== null && posY !== null) {
        var completeurl = location.href;
        var ohne_hash = completeurl.split("#");
        completeurl = ohne_hash[0]+'#trajectory-'+ 'x'+posX+'y'+posY;
        pushHistory(completeurl);
    }
    var selected_index = $('#model-valid').prop("selectedIndex");
    if(selected_index > $('#model-valid-hidden option').length - 1) { selected_index = $('#model-valid-hidden option').length - 1; }
    $('#model-valid-hidden').prop("selectedIndex", selected_index);
    var model_valid_hidden = $('#model-valid-hidden').val();
    var run_date = model_valid_hidden.split('#');
    $('#obs-detail-3h-table').html('');
    $('#obs-detail-3h-label').html('&nbsp;');
    $('#obs-detail-3h-js').hide(); 
    var model = $('#model').val();

    traj_script_url = '/js/trajectories.lib.js?' + $('#traj-version').attr('data-value');
    if(!traj_script_loaded || $('script[src="'+traj_script_url+'"]').length == 0) {
        $('<script>')
            .attr('type', 'text/javascript')
            .appendTo('head')
            .on('load', function() {
                showTrajMap(model, run_date, posX, posY);
                traj_script_loaded = true;
            }).on('error', function() {
                $('script[src="'+traj_script_url+'"]').remove();
            }).attr('src', traj_script_url);
    } else {
        showTrajMap(model, run_date, posX, posY); // in trajectories.lib.js
    }

};

var vectorAnimationHandle = null;
var fixVectorInterval = function(chart) {


    if(+$('#model-param').val() != 90 && +$('#model-param').val() != 1083)
        return;
    


    //Interval Fix
    var lastIndex = false;

    $.each(chart.series[0].data, function (i, point) {
        
        if(typeof point.graphic === 'undefined') return;

        point.graphic.removeClass('hidden');

        if(lastIndex === false) {

            if(point.originalDirection !== 0)
                lastIndex = i;
            return;
        }

        if(point.originalDirection === 0) {
            point.graphic.addClass('hidden');
            return;
        }

        var lastPoint = chart.series[0].data[lastIndex];
        
        if(point.plotX - lastPoint.plotX < chart.series[0].options.vectorLength + chart.series[0].options.lineWidth/2) {
            point.graphic.addClass('hidden');
            return;
        }

        point.graphic.removeClass('hidden');
        lastIndex = i;
    });


    //Animate Vectors
    var animate = function() {

        if(this.hasClass('hidden'))
            return;

        dir = this.direction + (Math.random() * 100 - 50);
        var transformAttr = 'translate(' + this.translateX + 'px ,' + this.translateY + 'px) rotate(' + dir + 'deg)';

        this.css({
            transform: transformAttr
        });

        this.direction = dir;

    }
    
    var animateSvgArray = [];
    chart.series[0].data.forEach(function(point, index) {
        if(typeof point.graphic === 'undefined') return;

        if(point.originalDirection < 0){        
            var svg = point.graphic;
            svg.css({
                transition: 'transform 0.4s ease', //cubic-bezier(.73,1.55,.6,-0.44)
                transform: ''
            })

            if(svg.hasClass('hidden'))
                return;

            svg.direction = point.direction;
            

            animateSvgArray.push(svg);
        }
        
    });

    clearInterval(vectorAnimationHandle);
    vectorAnimationHandle = setInterval(function() {
        animateSvgArray.forEach(function(svg, index) {
            
            animate.call(svg);

        });
    }, 200);


};

var obs_calculate_accumulated = function(timespan) {

    if(typeof hc_obs_series === 'undefined' || !hc_obs_series || !hc_obs_series[0]) return [];

    var acc_data = [];
    var timespan = +$('#obs-detail-3h').attr('data-timespan') || 24;
    var min_timestamp = hc_obs_max - timespan * 36e5;

    if(hc_obs_series[0].data) {
        var acc_val = 0;
        acc_data.push({x: min_timestamp, y: acc_val});
        hc_obs_series[0].data.forEach(function(point, index) {
            if(point.x > min_timestamp) {
                acc_val += point.y;
                acc_data.push({x: point.x, y: acc_val});
            }
        });
    }
    return acc_data;
};

var hc_drawn_intervall_handle = null;
var draw_obs_graph = function() {

    if(typeof hc_obs_series === 'undefined')
        return;
    
    var timezone_id_local = typeof timezone_id !== 'undefined' ? timezone_id : null;

    Highcharts.setOptions({
        global: {
            /**
             * Use moment-timezone.js to return the timezone offset for individual 
             * timestamps, used in the X axis labels and the tooltip header.
             */
            // getTimezoneOffset: function (timestamp) {
            //     return -moment.tz(timestamp, timezone_id).utcOffset();
            // },
            timezone: timezone_id_local || $('#real-user-timezone').attr('data-value') || 'UTC'
        },
        lang: typeof hc_user_settings_lang !== 'undefined' ? hc_user_settings_lang : {
            loading: 'Wird geladen...',
            months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            shortMonths: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        }
    });

    var initialHeight = 300;
    var tooltipPositioner = function (w,h,p) {
        if(window.innerWidth >= 1200) {
            console.log(p);
            return {x: p.plotX, y: p.plotY}
        }

        if(p.plotX/this.chart.chartWidth>0.5)
            if(this.chart.chartWidth < 410)
                return { x: 0, y: 0 };
            else
                return { x: this.chart.plotLeft, y: 0 };
        else
            return { x: this.chart.chartWidth-w-10, y: 0 };
    };

    var titleSuffix = (hc_obs_unit !== '' ? ' (' + hc_obs_unit + ')' : '');
    if(titleSuffix.indexOf('Fälle') !== false || titleSuffix.indexOf('cases') !== false) {
        titleSuffix = '';
    }

    var defaultObsSettings = {
        chart: {
            type: 'spline',
            height: initialHeight,
            spacingLeft: 0,
            spacingRight: 10,
            events: {
                load: function(){
                    if($('#model').val() !== 'covid19') {
                        drawNightShadows(this,1);
                        drawHourlyLabels(this, 'obs');
                        fixVectorInterval(this);
                    }

                },
                redraw: function(){
                    if($('#model').val() !== 'covid19') {
                        drawNightShadows(this,1);
                        drawHourlyLabels(this, 'obs');
                        fixVectorInterval(this);
                    }

                    if(window.innerWidth >= 1200) {
                        this.update(
                            {
                                chart: {
                                    height: initialHeight * 1.5
                                },
                                tooltip: {
                                    positioner: undefined,
                                    distance: 40
                                }
                            }, false);
                    }
                    else {
                        this.update({
                                chart: {
                                    height: initialHeight
                                },
                                tooltip: {
                                    positioner: tooltipPositioner,
                                    distance: 16
                                }
                            }, false);                    
                    }
                }
            },
            style: {
                'user-select': 'none',
                '-webkit-user-select': 'none'
            }
        },
        title: {
            text: hc_obs_param_name + titleSuffix,
            floating: false,
            margin: 7,
            align: 'left',
            style: {
                fontSize: '11px',
                color: cssVar('--color-text')
            }
        },
        legend: {
            useHTML: true   
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                hour: '%H:%M',
                day: '<b>%a</b>, %e. %b'
            },
            labels:{
                useHTML: true,
                align: 'center',
                y: 25,
                style: {
                    color: cssVar('--color-text')
                },
                formatter: function () {
                    if ($('#model').val() == 'covid19') {
                        return Highcharts.dateFormat('%m/%Y', this.value);
                    }
                    else if(displayLanguage()=="EN"){
                        var date_format;
                        var day = Highcharts.dateFormat("%e", this.value);
                        if(this.chart.plotWidth>370) {
                                                date_format='<b>%a</b>, %b, '+day+nth(day);
                                            }
                        else {
                                                date_format='<b>%b '+day+nth(day)+'</b>';
                                            }
                          return Highcharts.dateFormat(date_format, this.value);
                    } else {
                        var date_format;
                        if(this.chart.plotWidth>300) {
                                                date_format='<b>%a</b>, %e. %b';
                                            }
                        else  {
                                                date_format='<b>%e.%m.</b>';
                                            }
                          return Highcharts.dateFormat(date_format, this.value);
                      }
                }
            },
            tickInterval: 24*36e5,
            gridLineWidth: 1,
            gridLineColor: cssVar('--hc-gridLineColor777777'),
            gridZIndex:1,
            minorTickInterval: 1*36e5,
            minorGridLineColor: cssVar('--hc-gridLineColorCCCCCC'),
            minorGridWidth: 1
        },
        yAxis: {
            title: false,
            labels: {
                format: "{value}",
                style: {
                    color: cssVar('--color-text')
                },
                formatter: function () {
                    return Highcharts.numberFormat(this.value,-1);
                },
                x: -5
            },
            allowDecimals: false,
            gridLineColor: cssVar('--hc-gridLineColorC0C0C0'),
            minorGridLineColor: cssVar('--hc-gridLineColorDFDFDF'),
            gridZIndex:1
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: hc_obs_unit,
            shape: 'square',
            zIndex: 50,
            positioner: tooltipPositioner,
            style: {
                color: cssVar('--color-text')
            },
            formatter: function () {
                var date_format;
                if ($('#model').val() == 'covid19') {
                    if(displayLanguage()=="EN"){
                        var day = Highcharts.dateFormat("%e", this.x);
                        date_format="%A, %b the "+day+nth(day)+" %Y";
                    } else {
                        date_format="%A, den %e.%B %Y"
                    }

                }
                else {
                    if(displayLanguage()=="EN"){
                        var day = Highcharts.dateFormat("%e", this.x);
                        date_format="%A, %b the "+day+nth(day)+" at %H:%M";
                    } else {
                        date_format="%A, den %e.%B, %H:%M Uhr";
                    }
                }
                var s = '<span style="font-size:10px">'+Highcharts.dateFormat(date_format, this.x)+ '</span> ';

                if(typeof this.points !== 'undefined') {
                    $.each(this.points, function () {

                        if(hc_obs_unit == 'inch' || $('#model-param').val() == 1007) {
                            s += '<br/>' + '<span style="color:' + this.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                            '<b>'+Highcharts.numberFormat(this.y,2) + '</b> ' + hc_obs_unit;
                        }
                        else {
                            if(typeof this.point.name != 'undefined' && this.point.name != '') {
                                s += '<br/>' + '<span style="color:' + this.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                                '<b>'+this.point.name + '</b> ';
                            } else {
                                s += '<br/>' + '<span style="color:' + this.color + '">' + '●' + '</span> '+ this.series.name + ': ' +
                                '<b>'+Highcharts.numberFormat(Math.round(this.y*10)/10,-1) + '</b> ' + hc_obs_unit;
                            }
                        }


                    });
                }
                //Symbole
                else if(typeof this.point !== 'undefined' && (hc_obs_symbol_chart == true || +$('#model-param').val() == 90 || +$('#model-param').val() == 1083) ) {
                    s += '<br/>' + '<span style="color:' + this.point.color + '">' + '●' + '</span> '+ this.point.series.name + ': ' +
                    '<br><b>'+ this.point.options.observationText + '</b> ' + hc_obs_unit;
                }


                return s;
            }
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                },
                crisp: false
            }
        },
        credits: { enabled: false },
        exporting: { enabled: false },
        series: hc_obs_series, 
        reflow: true
    };


    //Merge specific parameter settings into options
    var highchartsSettings = defaultObsSettings;

    if(typeof hc_obs_settings !== 'undefined')
        highchartsSettings = $.extend(true, {}, defaultObsSettings, hc_obs_settings);


    initialHeight = highchartsSettings.chart.height;

    if(window.innerWidth >= 1200) {
        highchartsSettings.chart.height = initialHeight * 1.5;
        highchartsSettings.tooltip.positioner = undefined;
        highchartsSettings.tooltip.distance = 40;
    }

    var timespan = +$('#obs-detail-3h').attr('data-timespan') || null;
    if(timespan !== null && $('#obs-detail-3h-table button.timespan-button[data-value='+timespan+']').length) {
        highchartsSettings.xAxis.min = hc_obs_max - timespan * 36e5;
    }

    var obs_extend_accumulated_sum = function() {
        var yAxis = $.extend(true, {}, defaultObsSettings.yAxis, {
            id: 'acc_axis',
            maxPadding: 0,
            tickAmount: 5,
            opposite: true,
            labels: {
                x: 2,
                style: {
                    fontSize: '9px'
                }
            },
            title: {
                text: hc_accumulated_title,
                style: {
                    fontSize: '9px',
                    color: '#333333',
                },
                margin: 10,
            },
        });

        var newYAxis = [
            highchartsSettings.yAxis,
            yAxis
        ];

        var series = {
            name: hc_accumulated_title,
            type: 'spline',
            yAxis: 'acc_axis',
            showInLegend: false,
            data: obs_calculate_accumulated()
        };

        hc_obs_series.push(series);
        highchartsSettings.series = hc_obs_series;
        highchartsSettings.chart.spacingRight = 0;
        highchartsSettings.yAxis = newYAxis;

    }

    if(typeof hc_is_accumulated !== 'undefined' && hc_is_accumulated) {
        obs_extend_accumulated_sum();
    }

    $('#hc_obs_graph').highcharts(highchartsSettings);

    if($('#obs-detail-3h-table #log-scale').length) {
        var hcGraph = $('#hc_obs_graph').highcharts();

        var maxExp = Math.ceil(Math.log(hc_data_max)/Math.log(10));
        var tickPos = [];
        for(var i = 0; i <= maxExp; i++) {
            tickPos.push(i);
        }

        var linAxis = hc_obs_settings.yAxis;
        var logAxis = {
            type: 'logarithmic',
            min: 1,
            tickPositions: tickPos
        };

        $('#obs-detail-3h-table #log-scale').change(function() {
            if($(this).prop('checked')) {
                hcGraph.update({
                    yAxis: logAxis,
                    series: hc_obs_series,
                });
            } else {
                hcGraph.update({
                    yAxis: linAxis,
                    series: hc_obs_series
                });
            }
        });
    }

    setTimeout(function() {
        $('#hc_obs_graph').highcharts().redraw();
        $('#hc_obs_graph').highcharts().reflow();
    }, 100);

}

var pollen_detail = function (station, station_name, counter) {
    $('#pollen-detail-content').html('');
    var c = true;
    if (counter === false) {
        c = false;
    }
    $.post(get_url_path()+'/ajax/pollenmonitor', {
            'model' : 'pollen_detail',
            'station_id' : station,
            'station_name' : station_name,
            'date' : $('#model-run').val(),
            'counter' : c
            }, function (data) {
                $('#pollen-detail-content').html(data);
                if(navigator.share && typeof navigator.share === 'function') {
                    $('.modal .modal-header .btn-navigator-share').show();
                }
          },'html');
    return false;
};

var refresh = function(e) {
    model_player_stop();
    if ($('#model').val()) {
        if (e) {
            e.preventDefault();
        }
        refreshDropdowns(1);
    }
};

var autoRefresh = function() {
    
    var areas = getAreaArray();
    var area_id = get_selected_area();

    params = {
        'model' : $('#model').val(),
        'model_param' : $('#model-param').val(),
        'model_source' : $('#model-source').val() || $('#area-source').val(),
        'model_member' : $('#model-member').val(),
        'model_location' : $('#model-location').val(),
        'area_id' : area_id,
        'areas_1' : areas[1],
        'areas_2' : areas[2],
        'areas_3' : areas[3],
        'areas_4' : areas[4],
        'areas_5' : areas[5],
        'areas_6' : areas[6],
        'areas_7' : areas[7],
        'areas_8' : areas[8],
        'areas_9' : areas[9],
        'geo_lat' : $('#geo-lat').val(),
        'geo_long' : $('#geo-long').val(),
        'fl_newest' : $('#newest-flag').val(),
        'fl_param' : $('#param-flag').val(),
        'fl_model' : $('#model-flag').val(),
        'real_refresh' : 1//,
    };

    if ($('#model').val() === 'blitze' || $('#model').val() === 'weltblitze') {
        if($('#blitze-5minonly').prop('checked')) {
            params.blitze_5minonly = 'true';
        }
        if ($('#model').val() === 'blitze') {
            params.blitz_filter = lightning_filter_value;
        }

    }

    if ($('#model').val() === 'sat') {
        if($('#sat-blitz-overlay-enabled').prop('checked')) {
            params.blitz_overlay_enabled = 'true';
        }
    }

    $.ajax(
        {
            url: get_url_path() + '/ajax/dropdown',
            data: params,
            cache: false,
            dataType: 'html'
        }
    ).success(function(data) {
        if (data === 'NOT_ALLOWED') {
            resetDropdowns();
            messageLayer(403,'#error-msg','#error-modal');
        }
        else if (data === 'PAYWALL_FEATURE') {
            resetDropdowns();
            showExtraNotice();
        }
        else if (data === 'UNAVAILABLE') {
            resetDropdowns();
            messageLayer(503,'#error-msg','#error-modal');
        }
        else if (data === 'TOO_MANY_REQUESTS') {
            resetDropdowns();
            messageLayer(429,'#error-msg','#error-modal');
        }
        else if (data === 'NO_MODEL_DATA') {
            $('.ac-btn[data-model]').each(function(){
                if ($(this).hasClass('btn-active') && isModelCard($(this).attr('data-model'))) {
                    $('#model').val($(this).attr('data-model'));
                }
            });
            messageLayer(121,'#error-msg','#error-modal');
        }
        else {

            if(data) {
                var newDataTimestamp = $(data).find('#model-valid').val();
                var currentDataTimestamp = $('#autorefresh-last-timestamp').val();

                //console.log({currentDataTimestamp: currentDataTimestamp, newDataTimestamp: newDataTimestamp, newDataAvailable: newDataTimestamp > currentDataTimestamp});

                if(newDataTimestamp > currentDataTimestamp) {

                    if(player_load_session == null) {
                        var tempIsPlaying = is_playing;
                        if(tempIsPlaying)
                            model_player_stop();

                        destroy_sliders();
                        $('#drop-downs').html(data);
                        $('#autorefresh-info > .glyphicon').addClass('glyphicon-spin'); 
                        setDropDownListener();
                        changeImage();
                        place_obs();
                        setup_sliders();
                        reloadIframeAds();
                        initDatePicker();
                        initVarSettings();
                        initOpenDivs();
                        refreshSliderElements();
                        if(displayCountry() === 'vh'){
                            $('#model')[0].data=data;
                            $('#model').trigger('change');
                        }

                    }

                    if(tempIsPlaying)
                        model_player_extend_level(images_extend);

                }

                $('#autorefresh-info > .glyphicon').removeClass('glyphicon-spin');
            }
        }
    });

};

var pageVisibility = 'visible';
var initPageVisibilityEvents = function() {
    // https://developer.mozilla.org/de/docs/Web/API/Page_Visibility_API

    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    pageVisibility = document[hidden] ? 'hidden' : 'visible';

    var lastAutoRefresh = 0;
    var wasPlaying = is_playing || is_preloading;
    function visibilityChangeCallbacks() {
        var msSinceLastVisAutoRefresh = (moment() - lastAutoRefresh);

        // console.log('Visibility changed: ' + pageVisibility + '\n' +
        //             'msSinceLastVisAutoRefresh: ' + msSinceLastVisAutoRefresh);

        if(is_playing || is_preloading)
            model_player_stop();

        var autoRefreshAllowed = initAutoRefresh();

        if(pageVisibility == 'visible') {
            // Nur AutoRefresh triggern, wenn Page wieder visible und letzter Trigger dieser Art mindestens 5 Sekunden her
            if(msSinceLastVisAutoRefresh > 5000 && autoRefreshAllowed) {
                autoRefresh();
                lastAutoRefresh = moment();
            }

            initSevereWeatherIcon();

            if(wasPlaying) {
                var isRadarPlayer = $('#radar-animation').length > 0;
                if(isRadarPlayer) {
                    model_player_start(2);
                } else {
                    modelcharts_player_start(2);
                }
            }
        }

    }

    function visibilityChangeHandler() {
        pageVisibility = document[hidden] ? 'hidden' : 'visible';

        if(pageVisibility == 'hidden') {
            wasPlaying = is_playing || is_preloading;
        }

        visibilityChangeCallbacks();
    }

    if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
        pageVisibility = 'visible';
        return;
    }

    document.addEventListener(visibilityChange, visibilityChangeHandler, false);
};

var autoRefreshHandle = null;
var currentAutoRefreshParam = null;
var initAutoRefresh = function(intervalSeconds, execAutoRefresh) {

    intervalSeconds = intervalSeconds || +$('#autorefresh-interval').data('value');

    if(typeof intervalSeconds !== 'number')
        intervalSeconds = 30;

    if($('#model').val() == 'radarpre' && intervalSeconds != -1)
        intervalSeconds = 150;

    var modelRestrictions = [
        'px250',
        'wwanalyze',
        'radar',
        'pl',
        'hagel',
        'blitze',
        'weltblitze',
        'storms',
        'floods',
        'radial',
        'sat',
        'regen',
        'singlepx',
        'zsweeps',
        'sweeps',
        'radar3d',
        'aurora',
        'plraw',
        'globus',
        'radarus',
        'radarpre'
    ];

    var initAutoRefreshResult = true;
    var debugMessage = '';

    if (initAutoRefreshResult && intervalSeconds === -1) { 
        initAutoRefreshResult =  false;
        debugMessage = 'Survival Mode active';
    }

    if (initAutoRefreshResult && modelRestrictions.indexOf($('#model').val()) === -1) { 
        initAutoRefreshResult =  false;
        debugMessage = 'Model is not allowed';
    }

    if (initAutoRefreshResult && ($('#paywall-account-type').attr('data-value') !== 'payaccount') && $('#autorefresh-last-timestamp').length == 0) { 
        initAutoRefreshResult =  false;
        debugMessage = 'Account no payaccount';
    }

    if (initAutoRefreshResult && !$('#autorefresh-last-timestamp').val() || !$('#model-valid').val()) { 
        initAutoRefreshResult =  false;
        debugMessage = 'Model is not allowed / Not in model view';
    }

    if (initAutoRefreshResult && pageVisibility === 'hidden') { 
        initAutoRefreshResult =  false;
        debugMessage = 'Page not visible.';
    }

    if (initAutoRefreshResult && is_playing == 1 && false) { 
        initAutoRefreshResult =  false;
        debugMessage = 'Model player is playing';
    }

    if (initAutoRefreshResult && $('#model-valid').val() !== $('#autorefresh-last-timestamp').val()) { 
        initAutoRefreshResult =  false;
        debugMessage = 'Not latest data timestamp';
    }

    currentAutoRefreshParam = $('#model').val() + ($('#model-param').val() ? '/' + $('#model-param').val() : '');

    if(isAutoRefreshActive()) {
        if(!initAutoRefreshResult) {
            clearInterval(autoRefreshHandle);
            autoRefreshHandle = null;

            $('#autorefresh-info').show().fadeOut(500);
            // console.log('AutoRefresh stopped: ' + debugMessage);
            return false;
        } else {
            $('#autorefresh-info').show();

            return true;
        }
    } else {
        if(!initAutoRefreshResult) {
            // console.log('AutoRefresh init result: Refused starting autorefresh - ' + debugMessage);
            clearInterval(autoRefreshHandle);
            autoRefreshHandle = null;

            $('#autorefresh-info').hide();

            return false;
        } else {
            // console.log('AutoRefresh init result: Started autorefresh with ' + intervalSeconds + 'sec interval');
            $('#autorefresh-info').fadeIn(500);
        }
    }

    clearInterval(autoRefreshHandle);
    autoRefreshHandle = setInterval(function() {
        //DEBUG
        //console.log('AutoRefresh interval');

        $('#autorefresh-info > .glyphicon').addClass('glyphicon-spin');

        autoRefresh();
    }, intervalSeconds * 1000);
    return true;

}

var stopAutoRefresh = function() {

    console.log('AutoRefresh force stopped');

    var debugBox = 'auto_refresh = <b>off</b><br>Grund: <em>Force Stop (Probably Model Player)</em>';
    $('.debug#auto-refresh').html(debugBox);

    clearInterval(autoRefreshHandle);
    autoRefreshHandle = null;
}

var isAutoRefreshActive = function() {
    return autoRefreshHandle !== null;
}

var dropdown_refresh_id = null;
var currentXhrRequest = null;
var refreshDropdowns = function(real_refresh, standort, params2, prevnext, jqobj, no_history) {

    dropdown_refresh_id = new Date().getTime();
    var this_dropwdown_refresh_id = dropdown_refresh_id;

    if(currentXhrRequest != null)
        currentXhrRequest.abort();

    model_player_stop();
    var so = $('#model-param').val();
    if (standort) {
        so = standort;
    }
    if (!prevnext) {
        prevnext = null;
    }
    var jahr = null;
    if ($('#model-year-block').val() !== 'blockyear' && $('#model-year').val() !== $('#model-year-def').val()) {
        jahr = $('#model-year').val();
    }
    var areas = getAreaArray(jqobj);
    var area_id = get_selected_area(jqobj);
    op = parseInt($('#current-regen-param').attr('data-param'));
    if ((parseInt(so) === 264 || parseInt(so) === 265) && op !== 264 && op !== 265 && $('#current-regen-now').attr('data-param') === 'true') {
        real_refresh = 1;
    }
    var params = {}
        
    params = {
                'model' : $('#model').val(),
                'model_member' : $('#model-member').val(),
                'model_source' : $('#model-source').val() || $('#area-source').val(),
                'model_location' : $('#model-location').val(),
                'area_id' : area_id,
                'areas_1' : areas[1],
                'areas_2' : areas[2],
                'areas_3' : areas[3],
                'areas_4' : areas[4],
                'areas_5' : areas[5],
                'areas_6' : areas[6],
                'areas_7' : areas[7],
                'areas_8' : areas[8],
                'areas_9' : areas[9],
                'geo_lat' : $('#geo-lat').val(),
                'geo_long' : $('#geo-long').val(),
                'fl_newest' : $('#newest-flag').val(),
                'fl_param' : $('#param-flag').val(),
                'fl_model' : $('#model-flag').val(),
                'real_refresh' : 0//,
            };
    if (real_refresh) {
        params.real_refresh=1;
        if (real_refresh === 1) {
            params.model_param = $('#model-param').val(); 
        }
        else if (real_refresh === 2)  {
            params.model_valid = $('#model-valid').val(); 
            params.model_run = $('#model-run').val(); 
            params.model_year = jahr; 
        }
        else if (real_refresh === 3)  {
            params.model_param = so; 
            params.model_valid = $('#model-valid').val(); 
            params.model_run = $('#model-run').val(); 
            params.model_year = jahr; 
        }
    }
    else {
            params.model_valid = $('#model-valid').val(); 
            params.model_run = $('#model-run').val(); 
            params.model_year = jahr; 
            params.model_param = so; 
            if (prevnext === 'prevyear') {
                params.prevnext = 'prev';
                params.prevyear = 'true';
            }
            else {
                params.prevnext = prevnext;
            }
    }

    if (params2) {
        if(typeof params2.obj_mode === 'undefined' || params2.obj_mode == 'replace') {
            params = params2;
        } else {
            if(params2.obj_mode == 'extend') {
                $.extend(params, params2);
            }
        }
        $('#model').val(params.model);
    }

    //Check für Modell- oder Param-Switch und löschen des model_valid properties, damit der neueste Zeitpunkt geladen wird und AutoRefresh aktiv bleibt.
    if(isAutoRefreshActive() && currentAutoRefreshParam != params.model + (params.model_param ? '/' + params.model_param : '')) {
        delete params.model_valid;
        //console.log(params);
    }
    
    if ($('#model').val() === 'blitze' || $('#model').val() === 'weltblitze') {
        if($('#blitze-5minonly').prop('checked')) {
            params.blitze_5minonly = 'true';
        }
        if ($('#model').val() === 'blitze') {
            params.blitz_filter = lightning_filter_value;
        }
    }

    if ($('#model').val() === 'sat') {
        if($('#sat-blitz-overlay-enabled').prop('checked')) {
            params.blitz_overlay_enabled = 'true';
        }
    }

    if ($('#model').val() === 'cyclone') {
        params.model_filter_storm = $('#model-filter-storm').val();
    }
    
    if (parseInt($('#model-player-interval').val()) > 0) {
        params.model_player_interval = $('#model-player-interval').val();
    }
    
    ajaxLoaderShowDelay(jqobj);
    currentXhrRequest = $.get(get_url_path()+'/ajax/dropdown', params, function (data) { 

                if(this_dropwdown_refresh_id != dropdown_refresh_id)
                    return;

                currentXhrRequest = null;

                ajaxLoaderHide(jqobj);
                if (data === 'NOT_ALLOWED') {
                    resetDropdowns();
                    messageLayer(403,'#error-msg','#error-modal');
                }
                else if (data === 'PAYWALL_FEATURE') {
                    resetDropdowns();replaceOverlay();replaceImage(null, true);
                    showExtraNotice();
                }
                else if (data === 'UNAVAILABLE') {
                    resetDropdowns();
                    messageLayer(503,'#error-msg','#error-modal');
                }
                else if (data === 'TOO_MANY_REQUESTS') {
                    resetDropdowns();
                    messageLayer(429,'#error-msg','#error-modal');
                }
                else if (data === 'NO_MODEL_DATA') {
                    $('.ac-btn[data-model]').each(function(){
                        if ($(this).hasClass('btn-active') && isModelCard($(this).attr('data-model'))) {
                            $('#model').val($(this).attr('data-model'));
                        }
                    });
                    messageLayer(121,'#error-msg','#error-modal');
                }
                else {
                    destroy_sliders();
                    $('#drop-downs').html(data);  
                    setDropDownListener();
                    changeImage(no_history);
                    place_obs();
                    setup_sliders();
                    setClickOverlayListener();
                    reloadIframeAds();
                    initDatePicker();
                    initVarSettings();
                    initOpenDivs();
                    preload_chart();
                    images_extend=1;
                    frame_count_orig=-1;
                    if(displayCountry() === 'vh'){
                        $('#model')[0].data=data;
                        $('#model').trigger('change');
                    }
                }
            },'html');
}

var rdfcPrognose = function() {
    if ($('#model').val() === 'radarpre') {
        if ($('#rdfc_prognose').attr('data') === 'true') {
            showAdditionalInfo();
            var uhrzeit = $('#legende-time').html();
            $('#rdfc-time').html(uhrzeit);
        }
        else {
            hideAdditionalInfo();
        }
    }
}

var addHistory = function(player, blitz, station) {
    // player: 1=play, 2=entferne Geohash, 3=skip GA view, 4=obs-detail, 5=hash remove with push history
    var completeurl = get_complete_share_url(player,blitz, station);

    if (player == 2) {
        var dat2 = completeurl.split('#');
        if (dat2[0]){
            completeurl = dat2[0];
        }
    }

    if(player == 5) {
        if(completeurl != window.location.href)
        if(window.history.pushState)
            window.history.pushState(null, historyUrl(), completeurl);
        else
            pushHistory(completeurl);
    }
    else if(player == 4) {
        if(completeurl != window.location.href) {
            if(blitz === 'replace') {
                window.history.replaceState(null, historyUrl(), completeurl);
            } else {
                pushHistory(completeurl);
            }
        }
    }
    else if(player == 2 || player == 1) {
        if(window.history.replaceState)
            window.history.replaceState(null, historyUrl(), completeurl);
        else
            window.location.hash = completeurl.split('#')[1] || '';
    }
    else {
        pushHistory(completeurl);
    }

    if (player != 1 && player != 3 && player != 5 && player != 2) {
        var count_url = completeurl.replace($('#full-base').val(),"");
        uaga4_pv(count_url);
    }
    refreshShareURL(player);
};


var uaga4_pv = function(url) {
    if (typeof ga !== 'undefined') {
        ga("send", "pageview", url);
    }
    else if (typeof gtag !== 'undefined') {
        gtag('event','page_view', {
            'page_location': url
        });
    }
    else {
        console.log('UA/GA4: Nothing triggered');
    }
};

var popHistory = function(event) {

    console.log(event);


};

var getFlagPlayer = function () {
    var starttime = $('#player-start-time').attr('data-value');
    var flag_player = true;
    if (parseInt(starttime)>0) {
        flag_player= false;
    }
    return flag_player;
};

var get_complete_share_url = function(player,blitz, station) {
    var model = $('#model').val();
    var url = $('#share-path').val();
    var file = $('#share-file').val();
    var completeurl = directURL(blitz, station);
    var param_id = $('#model-param').val();
    var flag_player = getFlagPlayer();
    if (completeurl.match(/NaN/g) != null || (player == 1 && flag_player)) {
        if (!file) {
            file = '';
        }
        else if(file.length) {
            if (isObsMode(model) || model === 'regen' || model === 'radial' ||  model === 'sweeps' || model === 'radar3d' || model === 'covid19' ||  model === 'zsweeps' || 
                    model === 'sat' || model === 'globus' || isModelCard(model) || 
                    model === 'storms' || model === 'floods' || isAnalyseModel(model) || isReanalyseModel(model)) {
                file = file+".html";
            }
            else if (!(model === 'radarus' && player == 1 && !radarus_is_dyn())) {
                file = file+"/";
            }
        }
        if (player == 1) {
            if (model === 'radarus' && !radarus_is_dyn() && file.length>0) {
                file = file+".html";
            }
            else if (model === 'radarus' && radarus_is_dyn()) {
                file=file+$('#model-location').val()+'.html';
            }

            completeurl = url+file;
            var ohne_hash = completeurl.split("#");
            completeurl = ohne_hash[0]+'#play-' + player_range_value[0] + '-' + player_range_value[1] + '-' + images_speed;
            if($('#model-player-interval').length)
                completeurl = completeurl + '-' + $('#model-player-interval').val();
            if($('#model').val() == 'radarpre')
                completeurl = ohne_hash[0] + '#play';
        }
        else {
            completeurl = url+file;
        }
    }
    if (player == 1 && !flag_player) {
        var ohne_hash = completeurl.split("#");
        completeurl = ohne_hash[0]+'#play-' + player_range_value[0] + '-' + player_range_value[1] + '-' + images_speed;
        if($('#model-player-interval').length)
            completeurl = completeurl + '-' + $('#model-player-interval').val();
    }
    if(player == 4) {
        var obsDetailId = $('#obs-detail').attr('data-station-id') || $('#obs-detail-3h').attr('data-station-id');
        var obsParamId = $('#obs-detail').attr('data-param-id') || $('#obs-detail-3h').attr('data-param-id');
        var timespan = $('#obs-detail-3h').attr('data-timespan') || null;
        obsDetailId = typeof obsDetailId === 'undefined' ? '' : obsDetailId;
        obsParamId = typeof obsParamId === 'undefined' ? '' : obsParamId;
        if(obsDetailId != '') {
            var ohne_hash = completeurl.split("#");
            completeurl = ohne_hash[0]+'#obs-detail-'+ obsDetailId;

            if(obsParamId !== '') {
                completeurl += ',' + obsParamId;
            }

            if(timespan !== null) {
                completeurl += '-' + timespan + 'h';
            }

        }
    }
    if(player == 6) {
        var obsDetailId = $('#obs-detail').attr('data-station-id') || $('#obs-detail-3h').attr('data-station-id');
        obsDetailId = typeof obsDetailId === 'undefined' ? '' : obsDetailId;

        if(obsDetailId != '') {
            var ohne_hash = completeurl.split("#");
            completeurl = ohne_hash[0]+'#sounding-'+ obsDetailId;
        }
    }
    return completeurl;
};

var get_url_path = function() {
    var ret = url_path;
    var tld = $('#tld').val();
    if (typeof tld !== 'undefined' && tld !== 'us') {
        ret = ret + '/' + tld;
    }
    return ret;
};


var set_to_latlong = function(lat, long) {
    gps_success({'coords':{'latitude':lat,'longitude':long}});
}
var gps_error = function () {
    messageLayer(201,'#error-msg','#error-modal');
};

var gps_success = function(pos) {
    var x = pos.coords.longitude;
    var y = pos.coords.latitude;
    var areas = getAreaArray();
    $.post(get_url_path()+'/ajax/locating', {
                       'lat' : y,
                       'long' : x,
                       'model' : $('#model').val(),
                       'model_param' : parseInt($('#model-param').val()),
                       'model_source' : $('#model-source').val() || $('#area-source').val(),
                       'model_location' : $('#model-location').val(),
                       }, function (data) {
                           if (data) {
                                var area_id = get_selected_area();
                                if (parseInt(data.area_id)) {
                                    area_id = parseInt(data.area_id);
                                };
                               
                                refreshDropdowns(null,null, {
                                    'model' : $('#model').val(),
                                    'model_valid' : $('#model-valid').val(),
                                    'model_run' : $('#model-run').val(),
                                    'model_param' : $('#model-param').val(),
                                    'model_source' : $('#model-source').val() || $('#area-source').val(),
                                    'model_location' : $('#model-location').val(),
                                    'area_id' : area_id,
                                    'areas_1' : areas[1],
                                    'areas_2' : areas[2],
                                    'areas_3' : areas[3],
                                    'areas_4' : areas[4],
                                    'areas_5' : areas[5],
                                    'areas_6' : areas[6],
                                    'areas_7' : areas[7],
                                    'areas_8' : areas[8],
                                    'areas_9' : areas[9],
                                    'geo_lat' : data.lat,
                                    'geo_long' : data.long
                                });
                            }
                            else {
                                    $('#error-msg').html("<p>Der passende Kartenausschnitt konnte nicht ermittelt werden.</p>");
                                    $('#error-modal').modal('show');
                            }

                        }, "json");
};

var gps_locating = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(gps_success, gps_error, {
                                    enableHighAccuracy: true,
                                    timeout: 20000,
                                    maximumAge: 600000
                                  });
    } else {
        gps_not_supported();
    }
};

var gps_locating_forecast = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(gps_success_forecast, gps_error, {
                                    enableHighAccuracy: true,
                                    timeout: 20000,
                                    maximumAge: 600000
                                  });
    } else {
        gps_not_supported();
    }
};

var gps_locating_wetter = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(gps_success_wetter, gps_error, {
                                    enableHighAccuracy: true,
                                    timeout: 20000,
                                    maximumAge: 600000
                                  });
    } else {
        gps_not_supported();
    }
};

var gps_locating_uwz = function () {
    if (navigator.geolocation) {
        $('#unwetterzentrale').html('<p>Sie werden jetzt automatisch geortet. Bitte kurz warten.</p>');
        navigator.geolocation.getCurrentPosition(gps_success_uwz, gps_error_uwz, {
                                    enableHighAccuracy: true,
                                    timeout: 20000,
                                    maximumAge: 600000
                                  });
    } else {
        gps_not_supported_uwz();
    }
};

var gps_locating_hpwetter = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(gps_success_hpwetter, gps_error, {
                                    enableHighAccuracy: true,
                                    timeout: 20000,
                                    maximumAge: 600000
                                  });
    } else {
        gps_not_supported();
    }
};

var gps_locating_kvwetter = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(gps_success_kvwetter, gps_error, {
                                    enableHighAccuracy: true,
                                    timeout: 20000,
                                    maximumAge: 600000
                                  });
    } else {
        gps_not_supported();
    }
};

var gps_locating_nkwetter = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(gps_success_nkwetter, gps_error, {
                                    enableHighAccuracy: true,
                                    timeout: 20000,
                                    maximumAge: 600000
                                  });
    } else {
        gps_not_supported();
    }
};

var gps_success_forecast = function(pos) {
    return gps_success_global(pos,'/ajax/locatingfc');
};

var gps_success_wetter = function(pos) {
    return gps_success_global(pos,'/ajax/locatingwt');
};

var gps_success_hpwetter = function(pos) {
    return gps_success_global(pos,'/ajax/locatinghp');
};
var gps_success_kvwetter = function(pos) {
    return gps_success_global(pos,'/ajax/locatingkv');
};
var gps_success_nkwetter = function(pos) {
    return gps_success_global(pos,'/ajax/locatingnk');
};

var gps_success_global = function(pos, url) {
    var x = pos.coords.longitude;
    var y = pos.coords.latitude;

    if(isNaN(parseFloat(x)) || isNaN(parseFloat(y))) {
        gps_error();
        return;
    }

    $.post(get_url_path()+url, {
                       'lat' : y,
                       'long' : x,
                       'model' : $('#model').val(),
                       'forecast_action' : $('#forecast-action-0').val()
                       }, function (data) {
                           if (data) {
                                document.location.href=data;
                            }
                            else {
                                gps_not_supported();
                            }

                        });
};

var gps_not_supported = function() {
    messageLayer(201, '#error-msg','#error-modal');
};

var closeMarker = function() {
    $('#map-marker').hide();
    $('#geo-x').val('');
    $('#geo-y').val('');
    $('#geo-lat').val('');
    $('#geo-long').val('');
    addHistory(2);
};

var forecastDayTable = function(city_id, idate, imodel) {
    if (typeof imodel === 'undefined') {
        imodel=$('#forecast-model').val();
    }
    $('#forecast-daytable').html('<p>Wird geladen...</p>');
    $.post(get_url_path()+'/ajax/forecastdaytable', {
                'city_id' : city_id,
                'date' : idate,
                'model' : imodel
                }, function (data) { 
                    $('#forecast-daytable').html(data);
                    scrollToAnchor('daytable');
                   });
};

var forecastDayTableHash = function(daytable) {
   scrollToAnchor(daytable);
};

var forecastModel = function(fl_changed) {
    forecastMT('fcxl', fl_changed);
};

var forecastModelTrend = function(fl_changed) {
    forecastMT('fcxl', fl_changed);
}
var forecastMT = function(url, fl_changed) {
    var params = {
                'city_id' : $('#city-id').val(),
                'lang':displayLanguage().toString().toLowerCase(),
                'unit_t':displayFCUnitT(),
                'unit_v':displayFCUnitV(),
                'unit_l':displayFCUnitL(),
                'unit_r':displayFCUnitR(),
                'unit_p':displayFCUnitP(),
                'nf':displayNumberFormat(),
                'tf':displayTimeformat(),
                'mos_station_id':$('#weather-fcxl-page').attr('data-mos-id'),
                'model':$('#forecast-model').val(),
                'func':$('#weather-fcxl-page').attr('data-func')
                };
    $('#forecast-full').html('<p>Wird geladen...</p>'); 
    
    if (fl_changed === true) {
        $('#fcxl-chart').html('<p>Wird geladen...</p>'); 
            var params2 = {
                'city_id':$('#weather-fcxl-page').attr('data-city'),
                'lang':displayLanguage().toString().toLowerCase(),
                'unit_t':displayFCUnitT(),
                'unit_v':displayFCUnitV(),
                'unit_l':displayFCUnitL(),
                'unit_r':displayFCUnitR(),
                'unit_p':displayFCUnitP(),
                'nf':displayNumberFormat(),
                'tf':displayTimeformat(),
                'func':$('#weather-fcxl-page').attr('data-func')
            };
        if ($('#weather-fcxl-page').attr('data-m') === 'swissmos' || $('#weather-fcxl-page').attr('data-m') === 'deu-mos' || $('#weather-fcxl-page').attr('data-m') === 'srb') {        
            params2.model = $('#weather-fcxl-page').attr('data-m');
            params2.mos_station_id = $('#weather-fcxl-page').attr('data-mos-id');
        }
        $.get(get_url_path()+'/ajax_pub/fcxlc', params2, function (data) { 
            $.get(get_url_path()+'/ajax/'+url, params, function (data2) { 
                    $('#fcxl-chart').html(data);
                    $('#forecast-full').html(data2);
                    reloadIframeAds();
                    plotGraph();
                    graphTabOnClick();
                    setModelSelectorListener();

                    $('.graphtab').each(function(){
                        if ($(this).attr('data-tab') == $('#weather-fcxl-page').attr('data-tab')) {
                            $(this).trigger("click");
                        }
                    });
                });
                
            },'html');
    } 
    else {
        $.get(get_url_path()+'/ajax/'+url, params, function (data) { 
                    $('#forecast-full').html(data);
                    reloadIframeAds();
                    setModelSelectorListener();
                    var new_url = $('#forecast-url').attr('data');
                    if (new_url) {
                        if ($('#weather-fcxl-page').attr('data-m') === 'swissmos' || $('#weather-fcxl-page').attr('data-m') === 'deu-mos' || $('#weather-fcxl-page').attr('data-m') === 'srb') {        
                            var mos_station_id = $('#weather-fcxl-page').attr('data-mos-id');
                            if (mos_station_id !== '' && typeof mos_station_id !== 'undefined') { 
                                new_url+='_'+mos_station_id;
                            }
                        } 
                        if (fl_changed !== true) {
                            if ($('#tab-url').attr("data-src")) {
                                new_url+='/'+$('#tab-url').attr("data-src");
                            }
                            pushHistory(new_url);
                            try {
                                var count_url = new_url.replace($('#full-base').val(),"");
                                uaga4_pv(count_url);
                            }
                            catch(e) {};
                        }
                    }
                   });
    }
};
        
var forecastModelEssentials = function(url) {
    var params = {
                'url' : $('#forecast-url').attr("data"),
                'model' : $('#forecast-model').val()
                };
    goto(params['url']+'/'+params['model']);
};

var forecastModelEnsemble = function(history) {
    var params = {
                'url' : $('#forecast-url-sw').attr("data"),
                'model' : $('#forecast-model').val(),
                'model_view' : $('#forecast-view-selector').attr('data-value'),
                'tab_url' : $('#tab-url').attr('data-src'),
                'sort' : $('#forecast-sort-selector').attr('data-value')
                };
    var url_ensemble = params['url']+'/'+params['model'];
    if (params['model_view']) {
        url_ensemble = url_ensemble + '-' +params['model_view'];
    }
    if (params['tab_url']) {
        url_ensemble = url_ensemble + '/' +params['tab_url'];
    }
    if(params['model_view'] === 'heatmap') {

        if(typeof sort_range_value !== 'undefined') {
            if(sort_range_value[0] != sort_range_start || sort_range_value[1] != sort_range_end) {
                var start_sort_moment = moment(hcensemble_heat_timestamps[sort_range_value[0]]).utc();
                var end_sort_moment = moment(hcensemble_heat_timestamps[sort_range_value[1]]).utc();

                params['sort_range'] = start_sort_moment.format('YYYYMMDDHHmm') + '-' + end_sort_moment.format('YYYYMMDDHHmm');
            }
        }


        if(params['sort'] && params['sort'] !== 'none') {
            url_ensemble = url_ensemble + '/' + params['sort'];

            if(params['sort_range']) {
                url_ensemble = url_ensemble + '/' + params['sort_range'];
            }

        }
    }
    
    if(history == 1) {
        pushHistory(url_ensemble, true);
    } else if(history == 2) {
        return url_ensemble;
    } else {
        localStorage.setItem('pageVerticalPosition', window.scrollY);
        goto(url_ensemble);
    }

};

var scrollToAnchor = function (aid){
    var aTag = $("a[name='"+ aid +"']");
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
};

var showAdditionalInfo = function() {
    $('.additional-info-element').stop(true).fadeIn(150);
}

var hideAdditionalInfo = function() {
    $('.additional-info-element').stop(true).fadeOut(150);
}


var goto = function(url) {
    document.location.href = url;
};
var temperature_canvas = '';
var initSatTemp = function() {
    if ($('#model').val() === 'sat') {
        const infraredMapping = {
            // Infrared-Param: [ Group of Parameters]
            123: [119, 120, 121, 122, 131, 133],
            128: [124, 125, 126, 127, 132, 134, 326],
            1428: [1426, 1427, 1429, 1430, 1431, 1432, 1433, 1434, 1435, 1436, 1438, 1442, 1514, 1515]
        };

        var o_url = $('#model-image>img').attr("src");

        var newlinktemp = o_url;

        for (const infrared in infraredMapping) {
            infraredMapping[infrared].forEach(satParamId => {
                newlinktemp = newlinktemp.replace(new RegExp(`_${satParamId}(-[0-9]+)?.jpg`, "g"), `_${infrared}.jpg`);
            })
        }
        
        $("#temperaturemap").attr("src", newlinktemp);
        var temperature_img = $('#temperaturemap')[0];

        if (typeof temperature_img !== 'undefinded') {
            temperature_img.onload=function() {
                temperature_canvas = $('<canvas/>')[0];
                temperature_canvas.width = temperature_img.width;
                temperature_canvas.height = temperature_img.height;
                temperature_canvas.getContext('2d').drawImage(temperature_img, 0, 0, temperature_img.width, temperature_img.height);
                $('#click-overlay').on('mousemove',movehandler);
                $('#click-overlay').on('mouseout', hideAdditionalInfo);
                $('#click-overlay').on('mouseenter', showAdditionalInfo);
            }
        }
    }
    else {
        $('#click-overlay').off('mousemove mouseenter mouseout');
    }
};

var movehandler= function(event) {
    var text = $('#copyright_hidden').attr('data');
    var param = document.getElementById('ac-id-param');
    var outputElement = $('#temperature-output-value');
    var outputElementWrapper = document.getElementById('temperatureoutput');

    var disabledTempOverlay = ['1442'].includes(param.dataset.value);

    if (temperature_canvas && (text == 'Satellitendaten: JMA' || text == 'Satellite data: JMA' || text == 'Satellitendaten: EUMETSAT' || text == 'Satellite data: EUMETSAT') && !disabledTempOverlay) {
        outputElementWrapper.style.display='block';
        var faktor = 1;
        if (temperature_canvas.width > 0) {
            faktor = $('#click-overlay').width()/temperature_canvas.width;
        }
        if (temperature_canvas.getContext('2d').getImageData(Math.floor(event.offsetX/faktor), Math.floor(event.offsetY/faktor), 1, 1).data) {
            var pixelData = temperature_canvas.getContext('2d').getImageData(Math.floor(event.offsetX/faktor), Math.floor(event.offsetY/faktor), 1, 1).data;
            var tempvalue=54-Math.round((144/255)*pixelData[2]);
            if (Math.floor(event.offsetY/faktor) > temperature_canvas.height-1 || Math.floor(event.offsetX/faktor) > temperature_canvas.width-1) {
            
            }
            else {
                !$('.additional-info-element').is(':visible') && showAdditionalInfo();
                if(displayUnits()=="us")
                	outputElement.text(Math.round(tempvalue*1.8+32) + '°F');
                else
                	outputElement.text(tempvalue + '°C');
            }
        }
    } else {
        outputElementWrapper.style.display='none';
    }
};

var initOpenDivs = function() {
    if (open_dd_div1) {
        //$('#'+open_dd_div1).show();
        $('[data-id="'+open_dd_div1+'"]').each(function() {
            if ($(this).hasClass('acc-btn-on')) {
                openAccLayerDirect($(this));
            }
        });
    }
    else if (open_dd_start/* && !$('#animation-player-mobile').is(':visible')*/) {
        open_dd_start = false;
        var loc = window.location.href;
        if (typeof loc !== 'undefined' && loc.search('_src') !== -1 /*|| $('#model').val() === 'px250'*/) {
            $('[data-id="acc-layer-sources"]').each(function() {
                    if ($(this).hasClass('acc-btn-on')) {
                       open_dd_div1 = 'acc-layer-sources';
                       openAccLayerDirect($(this));
                    }
                });
        }
        if (typeof loc !== 'undefined' && loc.search('.html') !== -1) {
            if (isObsMode($('#model').val()) || isReanalyseModel($('#model').val()) || isAnalyseModel($('#model').val())) {
                $('[data-id="acc-layer-params"]').each(function() {
                    if ($(this).hasClass('acc-btn-on')) {
                       open_dd_div1 = 'acc-layer-params';
                       openAccLayerDirect($(this));
                    }
                });
            }
            else if (loc.search('orogra') !== -1) {
                $('[data-id="acc-layer-model"]').each(function() {
                    if ($(this).hasClass('acc-btn-on')) {
                       open_dd_div1 = 'acc-layer-model';
                       openAccLayerDirect($(this));
                    }
                });
            }
            else if (isModelCard($('#model').val())) {
                $('[data-id="acc-layer-valid"]').each(function() {
                    if ($(this).hasClass('acc-btn-on')) {
                       open_dd_div1 = 'acc-layer-valid';
                       openAccLayerDirect($(this));
                    }
                });
            }
            else if ($('#model').val() === 'radarus') {
                $('[data-id="acc-layer-location"]').each(function() {
                    if ($(this).hasClass('acc-btn-on')) {
                       open_dd_div1 = 'acc-layer-location';
                       openAccLayerDirect($(this));
                    }
                });
            }
            else {
                $('[data-id="acc-layer-params"]').each(function() {
                    if ($(this).hasClass('acc-btn-on')) {
                        open_dd_div1 = 'acc-layer-params';
                        openAccLayerDirect($(this));
                    }
                });
            }
        }
        else {
            $('[data-id="acc-layer-params"]').each(function() {
                if ($(this).hasClass('acc-btn-on')) {
                    open_dd_div1 = 'acc-layer-params';
                    openAccLayerDirect($(this));
                }
            });
        }
    }
    if (open_dd_div2) {
        $('#'+open_dd_div2).show();
    }
    if (open_dd_tab_params) {
        $('[aria-controls="'+open_dd_tab_params+'"]').trigger('click');
        scrollTopParam();
    }
    if (open_dd_tab_valids) {
        $('[aria-controls="'+open_dd_tab_valids+'"]').trigger('click');
    }
    if (open_dd_tab_models) {
        $('[aria-controls="'+open_dd_tab_models+'"]').trigger('click');
    }
    if (open_dd_valids) {
        preventDataLayerPush.value = 1;
        $('[data-value="'+open_dd_valids+'"]').trigger('click');
    }

};

var satHelp = function() {
    $('.sat-help').hide();
    var tmp = parseInt($('#model-param').val());
    if (tmp === 120 || tmp === 125) {
        $('.sat-help-hd').show();
    }
    else if (tmp === 121 || tmp === 126) {
        $('.sat-help-topalarm').show();
    }
    else if (tmp === 122 || tmp === 127) {
        $('.sat-help-color').show();
    }
    else if (tmp === 123 || tmp === 128) {
        $('.sat-help-infrarot').show();
    }
    else if (tmp === 131 || tmp === 132) {
        $('.sat-help-nature').show();
    }
    else if (tmp === 133 || tmp === 134) {
        $('.sat-help-nebel-check').show();
    }
    else if (tmp === 136 || tmp === 138 || tmp === 140 || tmp === 142 || tmp === 144) {
        $('.sat-help-globushd').show();
    }
    else if (tmp === 135 || tmp === 137 || tmp === 139 || tmp === 141 || tmp === 143) {
        $('.sat-help-globus').show();
    }
    else {
        $('.sat-help').show();
    }
};

var gaProperty = 'UA-63122815-23';
// Disable tracking if the opt-out cookie exists.
var disableStr = 'ga-disable-' + gaProperty;
if (document.cookie.indexOf(disableStr + '=true') > -1) {
  window[disableStr] = true;
}
// Opt-out function
var gaOptout = function() {
  document.cookie = disableStr + '=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
  window[disableStr] = true;
  alert("Google Analytics wurde auf dieser Seite deaktiviert.")
};

var strPubTargeting = function () {
    var tkeys = {};
    var targeting = decodeURI($('#strpub-targeting').attr('data-value'));
    if (targeting) {
        var keys = targeting.split("|");
        if (keys.length) {
            for (i=0;i<keys.length;i++) {
                if (keys[i]) {
                    var tmp2 = keys[i];
                    var tmp = tmp2.split("%3D");
                    if (tmp.length) {
                        var name = tmp[0];
                        tkeys[name]=tmp[1].replace("%2C",",");
                    }
                }
            }
        }
    }
    return tkeys;
};

var reloadStrPuball = function () {
    try {
        console.log('SDG.Publisher reload all slots.');
        SDG.Publisher.loadAllSlots(true);
    }
    catch(err) {
        console.log('ERROR: SDG.Publisher konnte keine Slots reloaden.');
    };
};

var regSl = function(SDG) {
    if (typeof SDG !== 'undefined') {
        console.log('SDG.Publisher start');
        if (SDG.Publisher && $('#strpub-domain').attr('data-value') === 'true') {
            $('.dkpw').each(function() {
                if (!$(this).is(":visible"))  {
                    $(this).html('');
                }
            } );
            var is_live = false;
            $('.strpub').each(function(){
                is_live=true;
            });
            try {
                if (is_live) {
                    console.log('SDG.Publisher initialisiert.');
                }
                var sdg_zone = $('#strpub-zone').attr('data-value');
                var sdg_slots = [];
                var slot_targeting=strPubTargeting();
                if (sdg_zone !== 'undefined' && sdg_zone.length) {
                    if (is_live) {
                        SDG.Publisher.setZone(sdg_zone);
                        console.log('SDG.Publisher-Zone gesetzt auf: '+sdg_zone);
                    }
                }
                $('.strpub,.stroeertest').each(function(){
                    var strpub_type = $(this).attr('data-type');
                    var strpub_id = $(this).attr('id');
                    var strpub_sizes= $(this).attr('data-remove-sizes');
                    //console.log('SDG-Slot: "'+strpub_type+'", ID: "'+strpub_id+'", Sizes: "'+strpub_sizes+'"');
                    try {
                        if (typeof sdg_slots[strpub_type] === 'undefined' && allowed_str_areas.includes(strpub_type)) {
                            if (is_live) {
                                sdg_slots[strpub_type]=SDG.Publisher.registerSlot(strpub_type, strpub_id);
                                if(strpub_type == "stickyfooter") {
                                    console.log("pinToBottom");
                                    sdg_slots[strpub_type].configure({pinToBottom:true});
                                }
                                console.log('SDG-Slot: "'+strpub_type+'" mit der ID "'+strpub_id+'" registriert.');
                            }
                            if (typeof strpub_sizes !== 'undefined' && strpub_sizes.length >0) {
                                try {
                                    var sdg_sizes_array=[];
                                    var tmp_sizes_array=strpub_sizes.split(',');
                                    for (var i=0;i<tmp_sizes_array.length;i++) {
                                        if (typeof tmp_sizes_array[i] !== 'undefined') {
                                            var tmp_hw = tmp_sizes_array[i].split('x');
                                            if (typeof tmp_hw[0] !== 'undefined' && typeof tmp_hw[1] !== 'undefined') {
                                                sdg_sizes_array.push([parseInt(tmp_hw[0]),parseInt(tmp_hw[1])]);
                                            }
                                        }
                                    }
                                    if (is_live) {
                                        sdg_slots[strpub_type].removeSizes(sdg_sizes_array);
                                        console.log('SDG-Slot: "'+strpub_type+'" folgende Groessen entfernt:');
                                        console.log(sdg_sizes_array);
                                    }
                                }
                                catch (err) {};
                            }
                            if (typeof slot_targeting !== 'undefined') {
                                try {
                                    if (is_live) {
                                        sdg_slots[strpub_type].setTargeting(slot_targeting);
                                        console.log('SDG-Slot: "'+strpub_type+'" Targeting gesetzt auf:');
                                        console.log(slot_targeting);
                                    }
                                }
                                catch (err) {
                                    console.log('ERROR: SDG-Slot: "'+strpub_type+'" Targeting fehlgeschlagen.');
                                };
                            }
                        }
                        else {
                            /*if ($(this).hasClass('stroeertest')) {
                                $(this).css('background','linear-gradient(to bottom right, #fbb722, #fbe5b6)');
                                $(this).css('border','1px dashed #fbac00');
                                $(this).addClass('stroeer-wrong');
                            }*/
                            console.log('WARNING: SDG-Slot: "'+strpub_type+'" bereits vorhanden oder ungueltig.');
                        }
                    }
                    catch(err) {
                        /*if ($(this).hasClass('stroeertest')) {
                            $(this).css('background','linear-gradient(to bottom right, #fbb722, #fbe5b6)');
                            $(this).css('border','1px dashed #fbac00');
                            $(this).addClass('stroeer-wrong');
                        }*/
                        console.log('ERROR: SDG-Publisher: Slot "'+strpub_type+'" konnte nicht registriert werden.');
                    }
                });
                try {
                    if (is_live) {
                        SDG.Publisher.transitionAdvertisements();
                        SDG.Publisher.finalizeSlots();
                        console.log('SDG.Publisher Slots finalisiert.');
                    }
                }
                catch(err) {
                    console.log('ERROR: SDG.Publisher konnte die Slots nicht finalisieren.');
                };
                try {
                    if (is_live) {
                        SDG.Publisher.loadAllSlots();
                        console.log('SDG.Publisher load all slots.');
                    }
                }
                catch(err) {
                    console.log('ERROR: SDG.Publisher konnte keine Slots laden.');
                };
            }
            catch(err) {
                console.log('SDG.Publisher konnte nicht initialisiert werden.');
            };
        }
    }
};





var reloadIframeAds = function() {
    reloadStrPuball();
};

var switchForecast = function(input) {
    var tmp = input.split('#');
    var output = tmp[0];
    var model = '';
    if (typeof tmp[1] !== 'undefined' && tmp[1]) {
        model = tmp[1];
    }
    var url = $('#forecast-url').attr('data');
    /*var tmp3 = url.split('/');
    if (tmp3.length > 6) {
        url = tmp3[0]+'/'+tmp3[1]+'/'+tmp3[2]+'/'+tmp3[3]+'/'+tmp3[4]+'/'+tmp3[5];
    }*/
    var tab2 = $('#tab-url').attr('data-src');
    if (output == 'ensemble') {
        url = url + '/' + model;
    } else if (output === 'xl' || output === 'xltrend') { 
        if ($('#weather-fcxl-page').attr('data-m') === 'swissmos' || $('#weather-fcxl-page').attr('data-m') === 'deu-mos' || $('#weather-fcxl-page').attr('data-m') === 'srb') {        
            var mos_station_id = $('#weather-fcxl-page').attr('data-mos-id');
            if (mos_station_id !== '' && typeof mos_station_id !== 'undefined') { 
                url+='_'+mos_station_id;
            }
        } 
    }
        
    if (typeof tab2 !== 'undefined' && tab2.length) {
        if (displayCountry() === 'vh' && (output === 'xl' || output === 'xltrend')) {
            url = url + '/euro';
        }
        url = url + '/' + tab2;
    }
    if (url) {
        url = url.replace('/xltrend','/DUMMY');
        url = url.replace('/xl','/DUMMY');
        url = url.replace('/ensemble','/DUMMY');
        document.location.href = url.replace('/DUMMY','/'+output);
        return false;
    }
    return true;
};


var showFAQ = function(model_in,param_in) {
    $('#faq-modal .modal-header').html('');
    $('#faq-modal .modal-body').html(loadingGif());
    var param = $('#model-param').val();
    var param2 = 0;
    var model = $('#model').val();
    if (model === 'px250') {
        param = $('#model-source').val();
        if (!param) {
            param = $('#source-flag').val();
        }
        
    }
    else if ((model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'RADAR_CH') {
        model = 'ch';
    }
    else if ((model === 'radarpre') && $('#legends_visibility').attr('data') === 'RADAR_AT') {
        model = 'radarpreat';
    }
    else if ((model === 'radarpre') && $('#legends_visibility').attr('data') === 'RADAR_CH') {
        model = 'radarprech';
    }
    /*else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'RADAR_AT') {
        model = 'at';
    }
    else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'RADARNL') {
        model = 'RADARNL';
    }
    else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'RADAR_ESTONIA') {
        model = 'RADAR_ESTONIA';
    }
    else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'NORWAY_RR') {
        model = 'NORWAY_RR';
    }
    else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'FINLAND_DBZH_COMPOSITE') {
        model = 'FINLAND_DBZH_COMPOSITE';
    }
    else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'UK_RAINRATE') {
        model = 'UK_RAINRATE';
    }
    else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'SLOVENIA_RR') {
        model = 'SLOVENIA_RR';
    }
    else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'RADAR_SOUTHTYROL') {
        model = 'RADAR_SOUTHTYROL';
    }
    else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'RADAR_FRANCE') {
        model = 'RADAR_FRANCE';
    }
    else if ((model === 'px250' || model === 'storms' || model === 'floods') && $('#legends_visibility').attr('data') === 'RADAR_SWE_PRO') {
        model = 'RADAR_SWE_PRO';
    }*/
    if (model_in) {
        model = model_in;
    }
    
    
    if (param_in) {
        param = param_in;
    }
    if (model === 'sat') {
        param2 = get_selected_area();
    }
    var aparams = {
                'model' : model,
                'model_param' : param,
                'model_param2' : param2,
                'lang' : displayLanguage()
                };
    if (model === 'sat') {
        aparams.timestamp = $('#model-valid').val();
    }
                
    $.get(get_url_path()+'/ajax_pub/faq', aparams, function (data) { 
                    if (data !== 'FALSE') {
                        $('#faq-modal').html(data);  
                        resize_video();
                        setElementHiders();
                    }
                   },'html');
    return true;
};

var loadFclist = function() {
    var aparams = {
        'unit_t':displayFCUnitT(),
        'unit_v':displayFCUnitV(),
        'unit_l':displayFCUnitL(),
        'unit_r':displayFCUnitR(),
        'unit_p':displayFCUnitP(),
        'nf':displayNumberFormat(),
        'lang' : displayLanguage(),
        'break' : $('#city-forecast-list').attr('data-break'),
        'action' : $('#city-forecast-list').attr('data-action'),
        'spacer' : $('#city-forecast-list').attr('data-spacer'),
        'class' : $('#city-forecast-list').attr('data-class'),
        'srcroute' : $('#city-forecast-list').attr('data-route'),
    };
    var obj = $('#city-forecast-list').attr('data-break');
    if (typeof obj !== 'undefined' && parseInt(obj) > 0) {
        $.get(get_url_path()+'/ajax_pub/fclist', aparams, function (data) { 
                        $('#city-forecast-list').html(data);  
                       },'html');
        return true;
    }
    return false;
}
var showMesoanalyse = function(city_id,lat,long,height) {

    if(typeof lat === 'undefined')
        lat = null;

    if(typeof lat === 'undefined')
        long = null;

    if(typeof lat === 'undefined')
        height = null;
        

    $('#faq-modal .modal-header').html('');
    $('#faq-modal .modal-body').html(loadingGif());
    if (city_id !== "null") {
        var aparams = {
            'city_id' : city_id,
            'unit_t':displayFCUnitT(),
            'unit_v':displayFCUnitV(),
            'unit_l':displayFCUnitL(),
            'unit_r':displayFCUnitR(),
            'unit_p':displayFCUnitP(),
            'nf':displayNumberFormat(),
            'lang' : displayLanguage(),
            'tf': displayTimeformat()
        };
    }
    if (city_id == "null" && lat !== "null" && long !== "null") {
        var aparams = {
            'city_id' : 'null',
            'lat' : lat,
            'long' : long,
            'height' : height,
            'unit_t':displayFCUnitT(),
            'unit_v':displayFCUnitV(),
            'unit_l':displayFCUnitL(),
            'unit_r':displayFCUnitR(),
            'unit_p':displayFCUnitP(),
            'nf':displayNumberFormat(),
            'lang' : displayLanguage(),
            'tf': displayTimeformat()
        };
    }
    
    $.get(get_url_path()+'/ajax_pub/mesoanalyse', aparams, function (data) { 
                    if (data !== 'FALSE') {
                        $('#faq-modal').html(data);  
                        resize_video();
                        setElementHiders();
                    }
                   },'html');
    return true;
};

var showExtraNotice = function() {
    var aparams = {
                'lang' : displayLanguage()
                };
    $.get(get_url_path()+'/ajax_pub/extranotice', aparams, function (data) { 
                    if (data !== 'FALSE') {
                        $('#faq-modal').html(data);  
                        resize_video();
                        setElementHiders();
                        $('#faq-modal').modal('show');
                    }
                   },'html');
    return true;
};

var switchXlLight = function (idcounter) {
  if (idcounter === '0') {
      $('#forecast-action-1').val($('#forecast-action-0').val());
      if ($('#forecast-action-0').val() !== 'wetter') {
            if (typeof $('#forecast-form-0').attr('action') !== 'undefined') { 
                $('#forecast-form-0').attr('action',$('#forecast-form-0').attr('action').toString().replace('/wetter/','/vorhersage/')); 
                $('#forecast-form-0').attr('action',$('#forecast-form-0').attr('action').toString().replace('/weather/','/forecast/')); 
            }
            if (typeof $('#forecast-form-1').attr('action') !== 'undefined') { 
                $('#forecast-form-1').attr('action',$('#forecast-form-1').attr('action').toString().replace('/wetter/','/vorhersage/')); 
                $('#forecast-form-1').attr('action',$('#forecast-form-1').attr('action').toString().replace('/weather/','/forecast/')); 
            }
      }
      else {
            if (typeof $('#forecast-form-0').attr('action') !== 'undefined') { 
                $('#forecast-form-0').attr('action',$('#forecast-form-0').attr('action').toString().replace('/vorhersage/','/wetter/')); 
                $('#forecast-form-0').attr('action',$('#forecast-form-0').attr('action').toString().replace('/forecast/','/weather/')); 
            }
            if (typeof $('#forecast-form-1').attr('action') !== 'undefined') { 
                $('#forecast-form-1').attr('action',$('#forecast-form-1').attr('action').toString().replace('/vorhersage/','/wetter/')); 
                $('#forecast-form-1').attr('action',$('#forecast-form-1').attr('action').toString().replace('/forecast/','/weather/')); 
            }
      }
      //$('#forecast-action-8').val($('#forecast-action-0').val());
  }
  else if (idcounter === '1') {
      $('#forecast-action-0').val($('#forecast-action-1').val());
      if ($('#forecast-action-1').val() !== 'wetter') {
            if (typeof $('#forecast-form-0').attr('action') !== 'undefined') { 
                $('#forecast-form-0').attr('action',$('#forecast-form-0').attr('action').toString().replace('/wetter/','/vorhersage/')); 
                $('#forecast-form-0').attr('action',$('#forecast-form-0').attr('action').toString().replace('/weather/','/forecast/')); 
            }
            if (typeof $('#forecast-form-1').attr('action') !== 'undefined') { 
                $('#forecast-form-1').attr('action',$('#forecast-form-1').attr('action').toString().replace('/wetter/','/vorhersage/')); 
                $('#forecast-form-1').attr('action',$('#forecast-form-1').attr('action').toString().replace('/weather/','/forecast/')); 
            }
      }
      else {
            if (typeof $('#forecast-form-0').attr('action') !== 'undefined') { 
                $('#forecast-form-0').attr('action',$('#forecast-form-0').attr('action').toString().replace('/vorhersage/','/wetter/')); 
                $('#forecast-form-0').attr('action',$('#forecast-form-0').attr('action').toString().replace('/forecast/','/weather/')); 
            }
            if (typeof $('#forecast-form-1').attr('action') !== 'undefined') { 
                $('#forecast-form-1').attr('action',$('#forecast-form-1').attr('action').toString().replace('/vorhersage/','/wetter/')); 
                $('#forecast-form-1').attr('action',$('#forecast-form-1').attr('action').toString().replace('/forecast/','/weather/')); 
            }
      }
//      $('#forecast-action-8').val($('#forecast-action-1').val());
  }
  /*else if (idcounter === '8') {
      $('#forecast-action-0').val($('#forecast-action-8').val());
      $('#forecast-action-1').val($('#forecast-action-8').val());
  }*/
};

var navHeight = function () {
  var fbwidth=390;
  if (parseInt($(window).height())>390) {
      fbwidth=parseInt($(window).height());
  }
  $('.navbar-collapse').css('max-height',fbwidth-50);
  $('.menue-button').css('max-height',fbwidth-50);
  $('#myfavourites').css('max-height',fbwidth-50);
};
  
var resizeWidgets = function () {
  navHeight();
  var fbwidth=500;
  if ($('.fb-page').parent('div').width()) {
      fbwidth=$('.fb-page').parent('div').width();
  }
  $('.fb-page').attr('width', fbwidth);
  if ($('body').width()<768) {
      $('.fb-page-outer').html('');
//      $('.fb-page').replaceWidth('');//attr('height', 250);
//      $('.twitter-timeline').replaceWidth('');//.attr('data-widget-id','663795483240996864');
  }
  else if ($('body').width()<992) {
      $('.fb-page').attr('height', 350);
      $('.twitter-timeline').attr('data-widget-id','663797206206570496');
  }
  else if ($('body').width()<1200) {
      $('.fb-page').attr('height', 420);
      $('.twitter-timeline').attr('data-widget-id','663803781461770240');
  }
};

var initDatePicker = function() {
    var min = $('#datepicker-startdate').attr('data');
    if (!min) {
        min = 0;
    }
    var max = $('#datepicker-enddate').attr('data');
    if (!max) {
        max = new Date();
    }
    var product = $('#datepicker-run').attr('data-product');
    $('#datepicker-run').datetimepicker({
        locale: displayLanguage(),
        format: 'YYYY-MM-DD',
        minDate: min,
        maxDate: max,
        daysOfWeekDisabled: $('#model').val() === 'modezwkly' ? [0,2,3,5,6] : [],
        useCurrent: false
        }).on('dp.hide', function (e) {
            var areas = getAreaArray();
            var area_id = get_selected_area();
            ajaxloadingarchivemsg = true;
            refreshDropdowns(false, false, {
                    'model' : $('#model').val(),
                    'model_valid' : $('#model-valid').val(),
                    'model_run' : $('#model-picked-date').val(),
                    'model_param' : $('#model-param').val(),
                    'model_source' : $('#model-source').val() || $('#area-source').val(),
                    'model_location' : $('#model-location').val(),
                    'area_id' : area_id,
                    'areas_1' : areas[1],
                    'areas_2' : areas[2],
                    'areas_3' : areas[3],
                    'areas_4' : areas[4],
                    'areas_5' : areas[5],
                    'areas_6' : areas[6],
                    'areas_7' : areas[7],
                    'areas_8' : areas[8],
                    'areas_9' : areas[9],
                    'geo_lat' : $('#geo-lat').val(),
                    'geo_long' : $('#geo-long').val()
                });
        }).on('dp.change',function (e) {
            if (product == 'model') {
                pushToDataLayer({'event':'model_actions','action':'switch_run','source':'datepicker'});
            }
            pushToDataLayer({'event':'archive','product':product,'year':new Date($('#model-picked-date').val()).getFullYear()});
        });
};


var getAreaArray = function (jqobj) {
    var fieldname = '';
    var areas = Array(10);
    if (jqobj && jqobj.attr('data-info') === 'first') {
        return areas;
    }
    for (i=1;i<=9;i++) {
        fieldname = '#form-areaid-'+i;
        if ($(fieldname).val() && parseInt($(fieldname).val()) > 0) {
            areas[i]=$(fieldname).val();
            if (jqobj && '#'+jqobj.attr('id') === fieldname) {
                break;
            }
            
        }
        else {
            break;
        }
    }
    return areas;
};

var showTrack = function(id) {
    resetZoom();
}

var resetZoom = function() {
    var scale = 'scale(1)';
    document.body.style.webkitTransform = scale;
    document.body.style.msTransform = scale; 
    document.body.style.transform = scale;
}

var initTracks = function() {
    $('.trck').on('click', function(e) {
        e.preventDefault();
        showTrackDetailByURL($(this).attr('href'), true);
    });
};


var initFloods = function() {
    $('.flds').on('click', function(e) {
        e.preventDefault();
        showFloodDetailByURL($(this).attr('href'), true);
    });
}

var showTrackDetailByURL = function (url, counter) {
    var tmp = url.replace(/#/g, "").split('-');
    showTrackDetail(tmp[0].replace("z",""),tmp[1],tmp[2],tmp[3], counter);
};


var showTrackDetail = function (datetime, blitzid, areaid, blitzhash, counter) {

    $('#stormtrckd').off('hide.bs.modal').on('hide.bs.modal', function(e) {
        addHistory(2);
    });

    $('#stormtrckd').modal('show');
    $('#stormtrckd-wrapper').hide();
    $('#stormtrckd-ajax-loader').show();
    var c = true;
    if (counter === false) {
        c = false;
    }
    $.get(get_url_path()+'/ajax/stormtracking', {
            'datetime' : datetime,
            'track_id' : blitzid,
            'area_id' : areaid,
            'track_hash' : blitzhash,
            'counter' : c,
            'lang' : displayLanguage()
            }, function (data) {
                $('#stormtrckd-ajax-loader').hide();
                $('#stormtrckd-wrapper').show();
                $('#stormtrckd-wrapper').html(data);
                if (c) { addHistory(2, 3);}
          },'html');
};


var showFloodDetailByURL = function (url, counter) {
    var tmp = url.replace(/#/g, "").split('-');
    showFloodDetail(tmp[0].replace("z",""),tmp[1],tmp[2],tmp[3], counter);
};

var showFloodDetail = function (datetime, blitzid, areaid, blitzhash, counter) {

    $('#flashflood').off('hide.bs.modal').on('hide.bs.modal', function(e) {
        addHistory(2);
    });

    $('#flashflood').modal('show');
    $('#flashflood-wrapper').hide();
    $('#flashflood-ajax-loader').show();
    var c = true;
    if (counter === false) {
        c = false;
    }
    $.get(get_url_path()+'/ajax/flashflood', {
            'datetime' : datetime,
            'track_id' : blitzid,
            'area_id' : areaid,
            'track_hash' : blitzhash,
            'counter' : c,
            'lang' : displayLanguage()
            }, function (data) {
                $('#flashflood-ajax-loader').hide();
                $('#flashflood-wrapper').show();
                $('#flashflood-wrapper').html(data);
                if (c) { addHistory(2, 4); }
          },'html');
};
var getSpecialUnderlay = function() {
    return ($('.model').val() === 'blitze' || $('.model').val() === 'weltblitze' || isObsMode($('#model').val()) || $('#model').val() === 'pollen' || $('#model').val() === 'forecast');
}
var values_shown = true;
var toggleValues = function(force_state) {

    if(typeof force_state !== 'undefined' && force_state !== null) {
        if(force_state) {
            values_shown = true;
            $('#text-overlay .value-container').fadeIn(150);
        } else {
            values_shown = false;
            $('#text-overlay .value-container').fadeOut(150);
        }
        return;
    }

    values_shown = !values_shown;
    if(!is_playing) {
        if(values_shown) {
            $('#text-overlay .value-container').fadeIn(150);
        } else {
            $('#text-overlay .value-container').fadeOut(150);
        }
    }

    if(is_preloading || is_playing) {
        model_player_stop();
        model_player_start(2);
    }

}

var toggleCities = function () {
    if ($('#model').val() !== 'plraw') {
        var special_underlay = getSpecialUnderlay();
        if (parseInt($('#map-overlay-setting').attr('data-value')) === 1) {
            if (special_underlay) {
                $('#map-overlay-trans').hide();
                $('#map-overlay').hide();
                $('#map-underlay-trans').hide();
                $('#map-underlay').show();
            }
            else {
                $('#map-overlay-trans').hide();
                $('#map-overlay').show();
                $('#map-underlay-trans').hide();
                $('#map-underlay').hide();
            }
            $('#map-overlay-setting').attr('data-value','0');
        }
        else if (parseInt($('#map-overlay-setting').attr('data-value')) === 0) {
            $('#map-overlay-trans').hide();
            $('#map-overlay').hide();
            $('#map-underlay-trans').hide();
            $('#map-underlay').hide();
            $('#map-overlay-setting').attr('data-value','2');
        }
        else {
            if (special_underlay) {
                $('#map-overlay-trans').hide();
                $('#map-overlay').hide();
                $('#map-underlay-trans').show();
                $('#map-underlay').hide();
            }
            else {
                $('#map-overlay-trans').show();
                $('#map-overlay').hide();
                $('#map-underlay-trans').hide();
                $('#map-underlay').hide();
            }
            $('#map-overlay-setting').attr('data-value','1');
        }
    }
    else {
        $('#map-overlay-trans').hide();
        $('#map-overlay').hide();
        $('#map-underlay-trans').hide();
        $('#map-underlay').hide();  
    }
};

var initModelSwitcher = function() {
    /*$('.v2-alt-models').hover(function(e){
        $('.v2-prime-row').hide();
        var eid = $(this).attr('data-href');
        if (eid) {  $(eid).show(); }
    });*/
    $('.v2-alt-models').on('click',function(e){
        $('.v2-prime-row').hide();
        var eid = $(this).attr('data-href');
        if (eid) {  $(eid).show(); }
    });
};

var showXLSymbole = function(id) {
    $(id).toggle();
};

var isObsMode = function(model) {
    if (    model === 'obs' ||
            model === 'obsama' ||
            model === 'obsclimall' ||
            model === 'obs3at' ||
            model === 'obsair' ||
            model === 'obslev3' ||
            model === 'obspfkm' ||
            model === 'obsradio' ||
            model === 'gma') {
        return true;
    }
    return false;
};

var isModelCard = function(model) {
    if (    model === 'moddeuhd' ||
            model === 'moddeuhd2' ||
            model === 'moddeu' ||
            model === 'moddeuai' ||
            model === 'modvhshd' ||
            model === 'modsuihd' ||
            model === 'modsuihdnow' ||
            model === 'modsuiultra1' ||
            model === 'modsuiultraf' ||
            model === 'modsuihdmos' ||
            model === 'modswisseu' ||
            model === 'modswissnow' ||
            model === 'modswissusa' ||
            model === 'modezswiss' ||
            model === 'modkor' ||
            model === 'modkorea' ||
            model === 'modrapid' ||
            model === 'modrpdid2' ||
            model === 'modswissmrf' ||
            model === 'modindia' ||
            model === 'modvhrpd' ||
            model === 'modvhrpdid2' ||
            model === 'modharmonie' ||
            model === 'modrussia' ||
            model === 'modjpn' ||
            model === 'modgfs13' ||
            model === 'modhim' ||
            model === 'modned' ||
            model === 'modfin' ||
            model === 'modgbrhd' ||
            model === 'modgbrsd' ||
            model === 'modgbr' ||
            model === 'modfrahd' ||
            model === 'modfrahdpi' ||
            model === 'modfra' ||
            model === 'modphhd' ||
            model === 'modphshd' ||
            model === 'modusa' ||
            model === 'modusaai' ||
            model === 'modusahd' ||
            model === 'modusarpd' ||
            model === 'modgfsfv3' ||
            model === 'modaus' ||
            model === 'modbra' ||
            model === 'modcan' ||
            model === 'modcma' ||
            model === 'modez' ||
            model === 'modezbeta' ||
            model === 'modezai' ||
            model === 'modvhez' ||
            model === 'modezrpd' ||
            model === 'modcamsecmwf' ||
            model === 'modgeosnasa' ||
            model === 'modnychd' ||
            model === 'modcencal' ||
            model === 'modsthcal' ||
            model === 'modnorcal' ||
            model === 'modvir' ||
            model === 'modbc' ||
            model === 'modnsw' ||
            model === 'modbeij' ||
            model === 'moduae' ||
            model === 'modoklatex' ||
            model === 'modezseason' ||
            model === 'modezwkly' ||
            model === 'modvhezwkly' ||
            model === 'modvhanalyze' ||
            model === 'modvhsoil' ||
            model === 'modtcshd' ||
            model === 'modtchd' ||
            model === 'modmulti' ||
            model === 'modmulticeur' ||
            model === 'modgwam' ||
            model === 'modcwam' ||
            model === 'modewam' ||
            model === 'modwaveecmwf' ||
            model === 'modwavegfs' ||
            model === 'modcanreg' ||
            model === 'modcanhressw' ||
            model === 'modharfmi' ||
            model === 'modhardmi' ||
            model === 'modukmo2km' ||
            model === 'modmulticeur' ||
            model === 'modiconch1' ||
            model === 'modiconch2' ||
            model === 'modauroraifs' ||
            model === 'modgraphifs' ||
            model === 'modpanguifs' ||
            model === 'modrpdiruc'
) {
        return true;
    }
    return false;
};

var isReanalyseModel = function(model) {
    return ['modconusrea', 'modera5', 'modcosmo6rea'].includes(model);

};

var isAnalyseModel = function(model) {
    if (    model === 'modmesoshd'
            ) {
        return true;
    }
    return false;
};

var modelWithPlayer = function(model) {
    if (    model === 'px250' || 
            model === 'wwanalyze' || 
            model === 'radarde' || 
            model === 'radar' || 
            model === 'radarus' || 
            model === 'radarpre' || 
            model === 'pl' ||  
            model === 'radial' ||  
            model === 'sat' ||  
            model === 'globus' ||  
            model === 'hagel' ||  
            model === 'blitze' ||
            model === 'weltblitze' ||
            model === 'storms' ||
            model === 'floods' ||  
            model === 'regen' ||  
            model === 'singlepx' ||  
            model === 'plraw' ||  
            model === 'sweeps' ||  
            model === 'radar3d' ||
            model === 'aurora' ||
            model === 'zsweeps' ||
            model === 'modmesoshd' ||
            model === 'covid19' ||
            isObsMode(model)
            ) {
        return true;
    }
    return false;
};


var initVarSettings = function() {
    if ($('#model').val() !== 'plraw') {
        var special_underlay = getSpecialUnderlay();
        if ($('#map-overlay-setting').attr('data-value') === '1') {
            if (special_underlay) {
                $('#map-overlay-trans').hide();
                $('#map-overlay').hide();
                $('#map-underlay-trans').show();
                $('#map-underlay').hide();
            }
            else {
                $('#map-overlay-trans').show();
                $('#map-overlay').hide();
                $('#map-underlay-trans').hide();
                $('#map-underlay').hide();
            }
        }
        else if ($('#map-overlay-setting').attr('data-value') === '2') {
            $('#map-overlay-trans').hide();
            $('#map-overlay').hide();
            $('#map-underlay-trans').hide();
            $('#map-underlay').hide();
        }
        else {
            if (special_underlay) {
                $('#map-overlay-trans').hide();
                $('#map-overlay').hide();
                $('#map-underlay-trans').hide();
                $('#map-underlay').show();
            }
            else {
                $('#map-overlay-trans').hide();
                $('#map-overlay').show();
                $('#map-underlay-trans').hide();
                $('#map-underlay').hide();
            }
        }
        if ($('#map-overlay-start').attr('data-value') === 'true') {
            if ($('#map-overlay-setting').attr('data-value') === '1') {
                if (special_underlay) {
                    $('#map-overlay-trans').hide();
                    $('#map-overlay').hide();
                    $('#map-underlay-trans').show();
                    $('#map-underlay').hide();
                }
                else {
                    $('#map-overlay-trans').show();
                    $('#map-overlay').hide();
                    $('#map-underlay-trans').hide();
                    $('#map-underlay').hide();
                }
            }
            $('#map-overlay-start').attr('data-value',false);
        }
    }
    else {
        $('#map-overlay-trans').hide();
        $('#map-overlay').hide();
        $('#map-underlay-trans').hide();
        $('#map-underlay').hide();  
    }
}

var actionFavourite = function(id, action) {
    if (parseInt(id)>0 && (action==='remove'||action==='save')) {
        $.post(get_url_path()+'/ajax/favourite', {
            'action' : action,
            'city_id' : id
            }, function (data) {
                if (data !== 'FALSE') {
                    $('.favourite-div').html(data);
                    hoverPopover();
                }
                else {
                    messageLayer(202, '#error-msg','#error-modal');
                }
          },'html');
    }
    return false;
};


var setFavourite = function(id) {
    return actionFavourite(id, 'save');
};

var removeFavourite = function(id) {
    return actionFavourite(id, 'remove');
};


var messageLayer = function (message_id, msg_id, modal_id) {
    $.get(get_url_path()+'/ajax_pub/messages', { 'message_id' : message_id, 'lang' : displayLanguage()}, 
                            function (data) {
                                $(msg_id).html(data);
                                $(modal_id).modal('show');
                            },'html');
};

var displayLanguage = function() {
    return $('#user-language').attr('data-value');
};

var displayUnits = function() {
    return $('#user-units').attr('data-value');
};

var displayFCUnitT = function() {
    return $('#user-units').attr('data-forecast-t');
};
var displayFCUnitL = function() {
    return $('#user-units').attr('data-forecast-l');
};
var displayFCUnitV = function() {
    return $('#user-units').attr('data-forecast-v');
};
var displayFCUnitP = function() {
    return $('#user-units').attr('data-forecast-p');
};
var displayFCUnitR = function() {
    return $('#user-units').attr('data-forecast-r');
};
var displayCUnitT = function() {
    return $('#user-units').attr('data-charts-t');
};
var displayCUnitL = function() {
    return $('#user-units').attr('data-charts-l');
};
var displayCUnitV = function() {
    return $('#user-units').attr('data-charts-v');
};
var displayCUnitP = function() {
    return $('#user-units').attr('data-charts-p');
};
var displayCUnitR = function() {
    return $('#user-units').attr('data-charts-r');
};
var displayNumberFormat = function() {
    return $('#user-units').attr('data-others-nf');
};
var displayTimeformat = function() {
    return $('#display-tzformat').attr('data-value');
};

var displayCountry = function() {
    var website = $('#user-country').attr('data-value');
    if (website.length == 2) {
        return website.toLowerCase();
    }
    else {
        return 'de';
    }
};

var displayLanguageLowerCase = function() {
    var lang=displayLanguage();
    if (lang.length == 2) {
        return lang.toLowerCase();
    }
    else {
        return 'de';
    }
};


var model_member_next = function(e) {
    if (checkChartcounter()) {
        var mid = '#model-member';
        var selected = model_player_get_selected_index(mid);
        var items = model_valids_get_item_count(mid+" option");
        if (selected < items) {
            if (selected == 0 && items>1) {
                $(mid).prop("selectedIndex", selected + 2);
            }
            else {
                $(mid).prop("selectedIndex", selected + 1);
            }
            $(mid).trigger('change');
        }
    }
    if (e) {
        e.preventDefault();
    }
        
};

var model_member_prev = function(e) {
    if (checkChartcounter()) {
        var mid = '#model-member';
        var selected = model_player_get_selected_index(mid);
        var items = model_valids_get_item_count(mid+" option");
        if (selected > 0) {
            $(mid).prop("selectedIndex", selected - 1);
            $(mid).trigger('change');
        }
    }
    if (e) {
        e.preventDefault();
    }
};

var pushHistory = function(url, replace) {
    if (History.pushState && !replace) {
        no_reload = true;
        History.pushState(null, historyUrl() , url);
    } 

    if (History.replaceState && replace) {
        no_reload = true;
        History.replaceState(null, historyUrl() , url);
    }
};

var historyUrl = function() {
    if (displayCountry() == 'us') {
        return 'Weather.us';
    }
    else if (displayCountry() == 'xx') {
        return 'Meteologix.com';
    }
    else if (displayCountry() == 'vh') {
        return 'Vereinigte Hagel';
    }
    else {
        return 'Kachelmannwetter.com';
    }
};

var scalePath = function(path) {
    if (typeof path == 'undefined') {
        path = displayCountry()+'/'+displayLanguageLowerCase();
    }
    return url_path+'/images/scale/'+path+'/';
}

var switchLocation = function(key) {
    if (parseInt($('#model-param').val()) === 360) {
        $('#model-param').val(357);
    }
    else if (parseInt($('#model-param').val()) === 361) {
        $('#model-param').val(359);
    }
    else if (parseInt($('#model-param').val()) === 426) {
        $('#model-param').val(425);
    }
    else if (parseInt($('#model-param').val()) === 428) {
        $('#model-param').val(427);
    }
    model_player_stop();
    $('#model-location').val(key);
    return refreshDropdowns(null,null,null,null,$('#model-location'));
//    $('#model-year').trigger('change');
}

var smartphoneStartupTracks = function() {
    var mapfaktor = parseInt($('#map-overlay').width())/760;
    if (mapfaktor>0) {
        $('#tracking-map area').each(function() {
            var coords = $(this).attr('coords');
            if (coords.length>0){
                var tmp = coords.split(",");
                var asize = tmp.length;
                if (asize >1) {
                    var a = Math.round(mapfaktor * parseInt(tmp[0]));
                    var newcoords = a.toString();
                    for(var i = 1; i < asize; i++) {
                        a = Math.round(mapfaktor * parseInt(tmp[i]));
                        newcoords = newcoords + ',' + a.toString();
                    }
                    $(this).attr('coords',newcoords);
                }
            }
        });
    }
};

var sat_blitz_overlay = function(is_init) {
    if($('#model').val() !== 'sat') {
        return;
    }

    if(is_playing || is_preloading) {
            model_player_stop();
            model_player_start(2);
    } else {
        replaceImage();
        refreshDropdowns();
    }
}

var lightning_filter = function(is_init) {
    if($('#model').val() !== 'blitze' && $('#model').val() !== 'weltblitze') {
        return;
    }

    if(is_playing || is_preloading) {
            model_player_stop();
            model_player_start(2);
    } else {
        var show = $('#model_image_visibility').attr('data');
        if(show === 'show') {
            var setting5min = $('#blitze-5minonly').prop('checked');

            if(setting5min) {
                $('.value-container').addClass('only-5min');
            } else {
                $('.value-container').removeClass('only-5min');
            }

            $('.value-container').removeClass('filter-1 filter-2 filter-3 filter-4');
            if(lightning_filter_value != 0 && $('#model').val() === 'blitze') $('.value-container').addClass('filter-' + lightning_filter_value);

            $('#blitzcounter-orig').html($('.lgt:visible').length);

            if(!is_init) addHistory(2);
        } else {
            replaceImage();
            if(!is_init) addHistory(2);
        }
    }
};

var lightning_slider = null;
var lightning_filter_value = 0;
var lightning_url_values = ['a','r','k','d','h'];

var destroy_lightning_slider = function() {
    if(lightning_slider) {
        $('#lightning-filter-slider').bootstrapSlider('destroy');
        lightning_slider = null;
    }
}

var setup_lightning_slider = function() {

    if(lightning_slider || $('#lightning-filter-slider').length == 0) return;

    lightning_filter_value = +$('#lightning-filter-slider').attr('data-slider-value');

    var onSlideStart = function(event) {
        onSlide(event);
    };

    var onSlide = function(event) {

    };

    var onSlideStop = function(event) {
        onSlide(event);
        
        var oldValue = lightning_filter_value;
        lightning_filter_value = event.value;

        if(is_playing || is_preloading) {
            model_player_stop();
            model_player_start(2);
        } else {
            replaceImage();
            addHistory(2);
        }
    };

    lightning_slider = $('#lightning-filter-slider').bootstrapSlider({
        value: lightning_filter_value,
    });

    lightning_slider.on('slide', onSlide);
    lightning_slider.on('slideStart', onSlideStart);
    lightning_slider.on('slideStop', onSlideStop);

}


var ajaxLoaderShowDelay = function(jqobj) {
  ajaxloadingdelay = true;
  setTimeout(function(){ajaxLoaderShow(false, jqobj, true);}, 900);
};

var ajaxLoaderShow = function(fl_long, jqobj, delay) {

    if(player_load_session != null)
        return;


    $('#ajax-loading-progress .progress-bar').css('width', '100%');
    if (fl_long === true) {
        $('#ajax-loading-moretext').show();
    }
    else {
        $('#ajax-loading-moretext').hide();
    }
    if (isModelCard($('#model').val()) && 
            ((typeof jqobj === 'object' && jqobj !== null && jqobj.attr('id') == 'model-run') || ajaxloadingarchivemsg)
            ) {
        $('#ajax-archive-loading').show();
    }
    else {
        $('#ajax-archive-loading').hide();
    }
    if (typeof delay !== 'undefined') {
        if (ajaxloadingdelay) {
            $('#ajax-loading').show();
        }
    }
    else {
        $('#ajax-loading').show();
    }
};

var ajaxLoaderHide = function(jqobj) {
    $('#ajax-archive-loading').hide();
    $('#ajax-loading').hide();
    ajaxloadingdelay = false;
    ajaxloadingarchivemsg = false;
    block_hiding_loadinglayer_when_loading = false;
};

var deleteFavSearch = function(rubrik, id) {
    $.post(get_url_path()+'/ajax/mylocations', {'action' : 'delete', 'rubrik' : rubrik, 'city_id' : id}, 
                            function (data) {
                                $('#mylocations').html(data);
                            },'html');
};

var switchCountry = function() {
    var loc = $('#cswitcher').val();
    if (typeof loc !== 'undefined' && loc.length > 7) {
        $('#cswitcher').attr('disabled', 'disabled');
        document.location.href = loc;
    } 
    
};

var getWeatherImage = function(domId, topicName, fltime, flfuture) {
    if (typeof domId !== 'undefined' && typeof topicName !== 'undefined') {
        $('#w-layer-loader').show();
        $.get(get_url_path()+'/ajax_pub/weatherimage', {
                'city_id':$('#weather-overview-page').attr('data-city'),
                'lang':displayLanguage().toString().toLowerCase(),
                'cunit_t':displayCUnitT(),
                'cunit_v':displayCUnitV(),
                'cunit_l':displayCUnitL(),
                'cunit_r':displayCUnitR(),
                'cunit_p':displayCUnitP(),
                'nf':displayNumberFormat(),
                'tf':displayTimeformat(),
                'm':topicName
            }, function (data) { 
                if (typeof data.image !== 'undefined') {
                    var img = new Image();
                    img.onload = function () { $('#w-layer-loader').hide(); }
                    img.error = function () { $('#w-layer-loader').hide(); }
                    img.src = data.image;
                    $(domId).html('<img src="'+data.image+'" alt="" />');
                }
                if (fltime === true && typeof data.starttime !== 'undefined') {
                    var prognose = '';
                    var zeit = data.starttime;
                    if (parseInt(flfuture)===1) {
                        prognose = $('#w-layer-time').attr('data-content');
                    }
                    if (prognose.length>0) {
                        zeit = prognose+' '+zeit;
                    }
                    $('#w-layer-time').html(zeit).css('display', 'block');
                }
            },'json');
    }
}


var _0xd06d=['\x55\x63\x4f\x36\x77\x36\x6f\x6b\x77\x34\x41\x61','\x57\x38\x4f\x63\x77\x71\x50\x44\x6d\x4d\x4f\x55','\x4c\x55\x7a\x44\x70\x41\x3d\x3d','\x42\x42\x63\x78\x77\x72\x35\x4a','\x77\x36\x6a\x44\x6f\x51\x38\x64\x77\x34\x48\x44\x6c\x68\x30\x3d','\x77\x6f\x2f\x43\x75\x4d\x4b\x66\x53\x67\x6f\x3d','\x77\x72\x51\x39\x50\x38\x4f\x48\x57\x38\x4f\x41\x77\x37\x56\x78\x77\x34\x35\x63\x77\x35\x73\x32\x48\x6d\x48\x44\x76\x63\x4b\x33\x77\x71\x7a\x44\x68\x63\x4b\x57\x77\x37\x66\x43\x68\x78\x6b\x3d','\x77\x35\x6e\x44\x6a\x63\x4b\x6b\x77\x72\x74\x6d','\x57\x63\x4b\x35\x41\x63\x4b\x76\x58\x77\x3d\x3d','\x61\x38\x4f\x6e\x77\x71\x4c\x44\x6a\x63\x4b\x5a\x59\x77\x3d\x3d','\x4b\x77\x55\x6c\x44\x52\x6f\x3d','\x77\x34\x76\x43\x69\x73\x4f\x41\x55\x56\x77\x3d','\x48\x38\x4b\x75\x77\x6f\x73\x53\x77\x72\x76\x44\x76\x51\x3d\x3d','\x77\x37\x66\x44\x71\x63\x4f\x56\x4c\x54\x4d\x3d','\x44\x54\x2f\x44\x6f\x4d\x4f\x51','\x4f\x45\x76\x44\x71\x63\x4f\x54\x77\x70\x45\x34\x77\x6f\x78\x55','\x4c\x42\x4c\x44\x74\x38\x4f\x41\x55\x67\x3d\x3d','\x4b\x73\x4f\x32\x77\x72\x52\x67\x77\x37\x45\x3d','\x77\x34\x38\x42\x77\x6f\x6f\x43\x54\x51\x3d\x3d','\x77\x36\x52\x72\x77\x70\x58\x44\x6c\x63\x4f\x34\x77\x35\x59\x4c\x50\x6e\x66\x43\x72\x7a\x50\x43\x73\x4d\x4b\x67','\x77\x72\x72\x44\x68\x30\x51\x3d','\x77\x34\x48\x44\x68\x31\x7a\x44\x71\x44\x4d\x3d','\x59\x38\x4f\x4d\x77\x35\x34\x4b\x77\x34\x63\x3d','\x48\x38\x4b\x75\x77\x6f\x6b\x58\x77\x71\x72\x44\x73\x4d\x4f\x30\x62\x51\x3d\x3d','\x77\x34\x62\x44\x73\x38\x4f\x70\x50\x52\x48\x43\x72\x4d\x4b\x48\x49\x77\x3d\x3d','\x59\x78\x33\x43\x71\x73\x4b\x67\x52\x4d\x4f\x74\x54\x41\x3d\x3d','\x4e\x44\x48\x44\x68\x63\x4f\x53\x66\x41\x3d\x3d','\x64\x4d\x4b\x52\x4c\x4d\x4b\x55','\x77\x71\x59\x65\x77\x35\x58\x43\x6f\x48\x4c\x43\x6a\x4d\x4f\x2f\x77\x72\x4d\x36\x77\x35\x54\x43\x67\x77\x3d\x3d','\x77\x34\x37\x43\x6b\x47\x37\x44\x6b\x38\x4b\x68\x4d\x51\x3d\x3d','\x57\x63\x4f\x57\x77\x35\x68\x66\x52\x77\x3d\x3d','\x77\x70\x33\x43\x6e\x63\x4b\x6d\x46\x6c\x41\x3d','\x65\x54\x76\x43\x67\x73\x4b\x63\x77\x34\x59\x3d','\x77\x36\x30\x45\x77\x6f\x30\x37\x62\x41\x3d\x3d','\x4f\x57\x33\x44\x76\x38\x4f\x65\x77\x35\x63\x35\x77\x70\x41\x44\x64\x48\x64\x32\x77\x37\x76\x43\x6b\x4d\x4f\x55\x77\x35\x56\x4c\x42\x6d\x63\x76','\x77\x70\x50\x43\x73\x38\x4b\x30\x55\x7a\x51\x3d','\x58\x38\x4f\x39\x77\x72\x7a\x44\x73\x63\x4f\x4f','\x77\x36\x6e\x43\x71\x73\x4f\x2b\x4c\x41\x72\x44\x6e\x78\x62\x44\x70\x79\x62\x43\x6d\x55\x45\x67\x64\x51\x3d\x3d','\x53\x38\x4f\x55\x77\x34\x4e\x6b\x77\x36\x34\x3d','\x77\x34\x50\x44\x6d\x38\x4b\x36\x77\x72\x4e\x2f\x57\x77\x3d\x3d','\x66\x38\x4f\x4b\x47\x7a\x39\x37','\x48\x79\x58\x44\x74\x38\x4f\x42','\x65\x4d\x4b\x31\x49\x73\x4b\x6a\x58\x77\x3d\x3d','\x77\x36\x58\x43\x68\x68\x55\x79\x52\x73\x4b\x44\x77\x71\x33\x44\x6d\x63\x4f\x42\x61\x4d\x4f\x6f\x56\x51\x3d\x3d','\x77\x36\x7a\x44\x6d\x67\x41\x4c\x77\x71\x55\x3d','\x77\x35\x44\x44\x76\x73\x4b\x48\x77\x70\x78\x6c','\x77\x35\x6e\x44\x70\x52\x73\x35\x77\x6f\x78\x7a','\x56\x77\x39\x59\x61\x38\x4f\x41','\x42\x30\x74\x41\x77\x71\x45\x6e','\x5a\x38\x4f\x33\x51\x7a\x50\x44\x68\x77\x3d\x3d','\x61\x78\x33\x43\x76\x38\x4b\x51\x59\x41\x3d\x3d','\x77\x36\x58\x44\x6f\x32\x59\x35\x46\x77\x3d\x3d','\x4c\x41\x7a\x44\x67\x73\x4f\x54\x57\x78\x50\x43\x76\x38\x4f\x55\x54\x38\x4f\x45\x51\x63\x4f\x43\x77\x70\x76\x44\x6d\x77\x44\x44\x6b\x7a\x78\x4e\x77\x34\x7a\x44\x6c\x63\x4b\x71\x48\x67\x45\x75\x4a\x6c\x68\x46\x77\x72\x66\x44\x6f\x73\x4b\x47\x77\x36\x31\x5a\x50\x67\x4d\x7a\x77\x37\x6b\x74\x47\x63\x4b\x78\x77\x71\x5a\x31\x55\x4d\x4f\x30\x77\x70\x6a\x43\x69\x38\x4b\x59\x52\x68\x31\x79\x45\x79\x66\x44\x6c\x77\x3d\x3d','\x4a\x45\x5a\x45\x77\x72\x51\x35','\x51\x79\x6e\x44\x72\x53\x6b\x46','\x77\x36\x56\x32\x77\x70\x2f\x44\x6d\x4d\x4f\x70\x77\x35\x49\x67','\x53\x4d\x4b\x64\x77\x72\x31\x39\x77\x6f\x41\x3d','\x77\x34\x72\x44\x69\x38\x4f\x56\x45\x52\x77\x3d','\x59\x6a\x37\x43\x6b\x63\x4b\x31\x77\x35\x6f\x3d','\x77\x72\x49\x41\x77\x34\x48\x43\x6f\x48\x72\x43\x67\x63\x4f\x53\x77\x72\x34\x33','\x63\x73\x4f\x46\x77\x35\x64\x78\x77\x37\x34\x3d','\x51\x73\x4f\x64\x77\x70\x37\x44\x68\x38\x4f\x72\x43\x63\x4b\x57\x47\x4d\x4f\x54\x77\x35\x63\x7a\x77\x37\x7a\x44\x6f\x46\x49\x36\x4f\x63\x4b\x50\x59\x67\x34\x73\x77\x71\x37\x43\x6f\x57\x33\x44\x74\x56\x50\x43\x75\x32\x48\x44\x67\x73\x4b\x69\x77\x37\x66\x43\x68\x47\x66\x43\x74\x38\x4f\x4e\x63\x4d\x4f\x66\x77\x70\x38\x78\x5a\x55\x51\x65\x49\x73\x4f\x64\x77\x35\x4a\x76\x77\x70\x4c\x43\x74\x31\x72\x44\x6c\x4d\x4b\x62\x77\x34\x6e\x43\x6b\x38\x4b\x63\x4e\x38\x4f\x35\x65\x77\x3d\x3d','\x77\x34\x62\x44\x74\x63\x4f\x31\x47\x42\x55\x3d','\x57\x4d\x4b\x6d\x77\x70\x4e\x38\x77\x6f\x45\x3d','\x46\x38\x4b\x5a\x77\x6f\x51\x35\x77\x72\x6b\x3d','\x77\x71\x5a\x39\x49\x73\x4b\x48\x55\x4d\x4b\x55\x77\x36\x55\x74\x77\x70\x38\x4d\x77\x34\x52\x68\x44\x53\x62\x44\x72\x38\x4f\x30\x77\x37\x33\x43\x69\x63\x4b\x54\x77\x72\x48\x43\x6e\x67\x3d\x3d','\x77\x70\x4c\x43\x69\x4d\x4f\x6d\x77\x34\x6b\x67','\x77\x72\x7a\x43\x74\x38\x4b\x34\x4d\x52\x4c\x44\x6c\x55\x54\x44\x74\x32\x66\x43\x67\x41\x3d\x3d','\x77\x35\x52\x4c\x77\x71\x44\x44\x6a\x63\x4f\x4b','\x77\x70\x72\x43\x75\x73\x4b\x71\x58\x42\x67\x43\x53\x54\x77\x4f\x77\x35\x38\x3d','\x77\x35\x64\x71\x77\x6f\x58\x44\x70\x63\x4f\x6f','\x77\x70\x7a\x44\x71\x54\x30\x78\x64\x63\x4f\x58\x66\x73\x4b\x45\x77\x35\x2f\x43\x69\x73\x4b\x6b\x4a\x4d\x4f\x71\x77\x71\x66\x44\x6e\x73\x4f\x59\x58\x6e\x37\x44\x72\x41\x3d\x3d','\x77\x6f\x7a\x44\x67\x63\x4f\x41\x48\x38\x4f\x64','\x77\x70\x6a\x44\x6c\x4d\x4f\x59\x4d\x38\x4f\x46\x63\x38\x4f\x77\x77\x36\x30\x65\x43\x57\x45\x73\x4e\x38\x4f\x46','\x63\x63\x4f\x70\x77\x35\x59\x62\x77\x35\x30\x3d','\x77\x35\x66\x44\x74\x4d\x4f\x39\x4a\x7a\x41\x3d','\x63\x38\x4b\x70\x4b\x63\x4b\x6c\x62\x41\x3d\x3d','\x64\x73\x4f\x6a\x51\x42\x37\x44\x6f\x77\x3d\x3d','\x54\x31\x44\x44\x71\x73\x4f\x57\x66\x51\x3d\x3d','\x77\x70\x66\x43\x75\x6e\x58\x44\x73\x38\x4f\x46','\x77\x70\x58\x44\x6c\x4d\x4f\x55\x77\x6f\x39\x68','\x5a\x77\x6e\x43\x6a\x38\x4b\x39\x77\x36\x59\x3d','\x77\x70\x62\x44\x71\x38\x4f\x41\x77\x72\x42\x4d','\x41\x4d\x4f\x62\x4a\x56\x6c\x58\x4c\x53\x4c\x44\x6b\x4d\x4b\x78\x77\x71\x46\x61\x51\x56\x4a\x56\x66\x41\x3d\x3d','\x66\x73\x4f\x51\x5a\x4d\x4b\x5a\x51\x41\x3d\x3d','\x77\x72\x37\x44\x6b\x68\x6e\x44\x71\x7a\x34\x3d','\x77\x35\x37\x44\x70\x46\x33\x44\x6f\x67\x34\x3d','\x77\x70\x50\x44\x73\x43\x58\x44\x75\x67\x63\x3d','\x43\x41\x54\x44\x68\x63\x4f\x4f\x77\x70\x67\x3d','\x77\x34\x6a\x44\x75\x6d\x72\x44\x6c\x67\x55\x3d','\x65\x6e\x54\x44\x6a\x4d\x4f\x68','\x77\x71\x50\x44\x6d\x43\x48\x44\x69\x43\x59\x3d','\x44\x31\x66\x43\x71\x53\x34\x75','\x62\x73\x4f\x69\x65\x4d\x4b\x64\x58\x41\x3d\x3d','\x77\x34\x44\x44\x75\x52\x34\x76\x77\x70\x77\x3d','\x77\x72\x62\x44\x73\x31\x67\x54\x77\x6f\x50\x44\x68\x56\x7a\x44\x6a\x4d\x4f\x5a','\x4f\x7a\x41\x68\x77\x70\x35\x68','\x77\x6f\x44\x44\x68\x47\x78\x71\x77\x70\x73\x3d','\x77\x36\x51\x6c\x77\x71\x51\x68\x63\x67\x3d\x3d','\x77\x70\x38\x4b\x77\x35\x7a\x43\x74\x6d\x30\x3d','\x77\x35\x72\x44\x74\x53\x45\x31\x77\x71\x45\x3d','\x77\x37\x2f\x44\x6f\x55\x72\x44\x70\x43\x55\x3d','\x77\x6f\x62\x44\x73\x6d\x35\x65\x77\x70\x59\x3d','\x61\x54\x66\x43\x75\x4d\x4b\x4c\x54\x41\x3d\x3d','\x54\x38\x4b\x4c\x42\x38\x4b\x4a\x61\x67\x3d\x3d','\x42\x38\x4f\x58\x77\x70\x39\x46\x77\x36\x51\x3d','\x56\x38\x4b\x58\x77\x6f\x46\x72\x77\x6f\x67\x3d','\x77\x37\x46\x78\x57\x63\x4f\x67\x52\x41\x3d\x3d','\x77\x70\x6e\x43\x67\x38\x4b\x4b\x46\x30\x67\x3d','\x64\x4d\x4f\x63\x66\x78\x6e\x44\x67\x77\x3d\x3d','\x4f\x4d\x4b\x66\x77\x72\x49\x3d','\x58\x4d\x4b\x45\x4d\x4d\x4b\x38\x51\x41\x3d\x3d','\x77\x71\x4c\x43\x76\x63\x4f\x54\x77\x37\x59\x30','\x4c\x4d\x4b\x39\x77\x6f\x30\x49\x77\x6f\x63\x3d','\x51\x38\x4f\x74\x77\x36\x77\x2f','\x77\x70\x33\x44\x6c\x31\x31\x37\x77\x70\x67\x3d','\x56\x63\x4f\x6e\x51\x73\x4b\x51\x63\x67\x3d\x3d','\x4c\x53\x77\x32','\x50\x6a\x51\x68\x50\x41\x3d\x3d','\x77\x72\x54\x44\x74\x68\x48\x44\x6b\x69\x4d\x3d','\x55\x79\x66\x44\x74\x38\x4f\x4d\x77\x72\x58\x43\x75\x38\x4b\x73','\x77\x71\x73\x4c\x77\x34\x76\x43\x6f\x6d\x6a\x43\x67\x41\x3d\x3d','\x77\x70\x6e\x43\x72\x73\x4b\x78\x54\x68\x67\x54\x54\x79\x73\x46','\x64\x38\x4f\x4d\x77\x34\x49\x56\x77\x37\x6b\x3d','\x77\x34\x66\x43\x6b\x73\x4f\x34\x55\x32\x4c\x43\x6c\x73\x4b\x42','\x63\x69\x66\x44\x6d\x52\x73\x42','\x51\x73\x4f\x5a\x77\x36\x31\x31\x55\x33\x34\x33\x77\x34\x78\x48\x44\x6e\x6b\x3d','\x77\x35\x66\x44\x76\x42\x38\x2b\x77\x35\x63\x3d','\x54\x38\x4f\x2b\x77\x6f\x76\x44\x76\x38\x4f\x53','\x61\x42\x35\x58\x56\x38\x4f\x37','\x4e\x42\x6e\x44\x68\x4d\x4f\x47\x52\x6c\x33\x44\x6e\x73\x4b\x55\x57\x4d\x4f\x45','\x77\x72\x76\x44\x6b\x45\x70\x7a\x77\x70\x6b\x56\x77\x72\x55\x62\x77\x35\x76\x44\x69\x30\x38\x3d','\x53\x63\x4f\x62\x77\x6f\x2f\x44\x6c\x73\x4f\x73\x56\x73\x4f\x38\x57\x38\x4f\x58\x77\x35\x34\x6c\x77\x37\x66\x44\x70\x67\x3d\x3d','\x77\x35\x48\x43\x6a\x56\x4c\x44\x6e\x73\x4b\x47','\x77\x71\x37\x44\x6b\x46\x4e\x5a\x77\x6f\x4d\x56\x77\x70\x73\x57\x77\x35\x7a\x44\x6b\x31\x6a\x44\x76\x56\x63\x6c\x77\x72\x76\x43\x6c\x43\x63\x70\x62\x31\x45\x3d','\x77\x71\x50\x44\x68\x6a\x72\x44\x72\x67\x4d\x3d','\x55\x4d\x4f\x4d\x77\x36\x6c\x5a\x55\x32\x34\x52\x77\x35\x5a\x59\x41\x33\x45\x3d','\x4a\x51\x72\x44\x68\x4d\x4b\x58\x77\x6f\x4d\x3d','\x77\x34\x4a\x31\x66\x38\x4f\x64\x52\x73\x4f\x55\x4f\x6e\x73\x3d','\x61\x53\x33\x44\x67\x52\x38\x51\x77\x37\x64\x33\x77\x72\x4c\x44\x6c\x33\x41\x57\x46\x55\x73\x3d','\x50\x4d\x4b\x4b\x77\x72\x41\x7a\x77\x70\x4c\x44\x74\x55\x62\x43\x70\x41\x3d\x3d','\x57\x73\x4f\x7a\x77\x34\x6b\x6f\x77\x36\x6b\x3d','\x77\x70\x76\x43\x76\x33\x66\x44\x6f\x73\x4f\x75\x5a\x47\x2f\x44\x67\x67\x3d\x3d','\x5a\x73\x4b\x7a\x77\x72\x68\x5a\x77\x70\x56\x36\x51\x73\x4b\x34','\x63\x63\x4b\x7a\x77\x6f\x56\x5a\x77\x6f\x4a\x39\x57\x4d\x4b\x49\x77\x72\x70\x48\x77\x36\x70\x35\x77\x34\x59\x3d','\x4b\x51\x2f\x44\x68\x73\x4b\x47\x77\x71\x6a\x44\x76\x73\x4f\x6d\x77\x6f\x34\x3d','\x63\x38\x4f\x6e\x77\x70\x44\x44\x6e\x63\x4b\x4f\x62\x6b\x70\x74','\x45\x46\x4c\x43\x6b\x41\x3d\x3d','\x77\x36\x67\x65\x77\x6f\x30\x4b\x5a\x51\x3d\x3d','\x77\x72\x52\x78\x63\x38\x4b\x43\x46\x4d\x4b\x4a\x77\x72\x77\x39\x77\x6f\x73\x52\x77\x70\x42\x2b\x56\x43\x2f\x43\x74\x63\x4f\x38\x77\x36\x6a\x43\x67\x63\x4f\x62\x77\x37\x44\x43\x68\x78\x67\x73\x77\x6f\x44\x43\x73\x77\x3d\x3d','\x77\x37\x52\x70\x77\x70\x7a\x44\x6e\x63\x4f\x34','\x77\x36\x44\x43\x6f\x43\x63\x64\x57\x51\x3d\x3d','\x45\x45\x58\x43\x68\x79\x51\x7a\x77\x6f\x37\x43\x68\x53\x4c\x44\x6f\x73\x4f\x50\x62\x51\x3d\x3d','\x4b\x79\x49\x65\x49\x78\x45\x3d','\x46\x38\x4f\x31\x43\x47\x6c\x54','\x61\x63\x4f\x35\x77\x6f\x6e\x44\x76\x73\x4b\x6f','\x64\x73\x4f\x48\x52\x38\x4b\x67\x62\x51\x3d\x3d','\x77\x34\x6c\x42\x77\x72\x58\x44\x68\x73\x4f\x71','\x77\x6f\x6a\x43\x73\x63\x4b\x76\x4b\x55\x34\x3d','\x52\x32\x37\x44\x74\x73\x4f\x56\x5a\x51\x3d\x3d','\x77\x34\x56\x71\x51\x4d\x4f\x41\x51\x41\x3d\x3d','\x49\x6b\x6c\x76\x77\x71\x41\x34','\x61\x63\x4f\x6e\x77\x72\x51\x3d','\x77\x34\x44\x44\x76\x63\x4f\x73\x49\x42\x6a\x43\x72\x4d\x4b\x65\x4b\x56\x6b\x3d','\x43\x43\x6b\x33\x77\x6f\x6c\x75\x62\x4d\x4f\x50\x62\x63\x4b\x6e','\x77\x35\x62\x44\x76\x48\x30\x5a\x4a\x41\x3d\x3d','\x77\x35\x49\x44\x77\x70\x6b\x75\x63\x67\x3d\x3d','\x77\x34\x54\x44\x6b\x73\x4b\x2f','\x47\x38\x4f\x67\x49\x46\x6c\x74','\x59\x54\x76\x44\x6d\x52\x34\x45','\x77\x70\x7a\x43\x6f\x45\x6a\x44\x76\x38\x4f\x6f','\x77\x37\x58\x43\x69\x73\x4f\x69\x55\x55\x73\x3d','\x41\x63\x4b\x55\x77\x71\x67\x78\x77\x70\x51\x3d','\x61\x38\x4f\x74\x77\x37\x35\x77\x54\x67\x3d\x3d','\x59\x53\x44\x43\x72\x38\x4b\x57\x77\x37\x4a\x4b\x59\x67\x3d\x3d','\x52\x78\x48\x44\x70\x69\x35\x56','\x77\x35\x37\x44\x69\x46\x44\x44\x6b\x6a\x49\x3d','\x50\x67\x2f\x44\x75\x38\x4b\x75\x41\x4d\x4f\x2b\x44\x54\x37\x44\x6d\x63\x4f\x41\x77\x35\x42\x59\x77\x35\x6e\x44\x6b\x45\x63\x3d','\x4c\x68\x44\x44\x75\x63\x4b\x62\x77\x71\x34\x3d','\x5a\x63\x4f\x6e\x77\x71\x66\x44\x6b\x41\x3d\x3d','\x5a\x38\x4f\x46\x59\x73\x4b\x4d\x57\x73\x4b\x74\x77\x71\x35\x4c\x4b\x48\x50\x43\x6b\x41\x3d\x3d','\x77\x34\x54\x44\x72\x67\x51\x31\x77\x6f\x78\x35','\x77\x70\x50\x44\x6d\x63\x4f\x35\x77\x70\x46\x30','\x77\x36\x6e\x44\x6f\x42\x30\x3d','\x53\x77\x6c\x59\x52\x38\x4f\x2b','\x52\x73\x4f\x62\x77\x35\x6f\x4a\x77\x36\x59\x3d','\x77\x72\x62\x43\x70\x38\x4b\x47\x42\x32\x73\x3d','\x44\x54\x6a\x44\x68\x73\x4f\x78\x77\x6f\x6b\x3d','\x77\x34\x44\x44\x73\x38\x4f\x74','\x77\x6f\x6a\x43\x73\x73\x4f\x5a\x77\x35\x77\x78','\x4d\x30\x66\x43\x6b\x42\x51\x73','\x77\x35\x33\x44\x6e\x67\x30\x6a\x77\x34\x41\x3d','\x61\x54\x44\x44\x69\x67\x6f\x42\x77\x37\x78\x47\x77\x6f\x6e\x44\x6d\x33\x4d\x58\x46\x45\x67\x3d'];(function(_0x39a947,_0x443854){var _0x34348a=function(_0x197aca){while(--_0x197aca){_0x39a947['push'](_0x39a947['shift']());}};var _0xb025bf=function(){var _0x1ef0ea={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x333469,_0x4c5b3b,_0xb223f9,_0x4aaee6){_0x4aaee6=_0x4aaee6||{};var _0x2c78df=_0x4c5b3b+'='+_0xb223f9;var _0x1ef4b1=0x0;for(var _0x1ef4b1=0x0,_0x29732a=_0x333469['length'];_0x1ef4b1<_0x29732a;_0x1ef4b1++){var _0x440bee=_0x333469[_0x1ef4b1];_0x2c78df+=';\x20'+_0x440bee;var _0x6f5492=_0x333469[_0x440bee];_0x333469['push'](_0x6f5492);_0x29732a=_0x333469['length'];if(_0x6f5492!==!![]){_0x2c78df+='='+_0x6f5492;}}_0x4aaee6['cookie']=_0x2c78df;},'removeCookie':function(){return'dev';},'getCookie':function(_0x3b9d20,_0x2474a0){_0x3b9d20=_0x3b9d20||function(_0x4a5abe){return _0x4a5abe;};var _0x544b03=_0x3b9d20(new RegExp('(?:^|;\x20)'+_0x2474a0['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x4f386a=function(_0x44f6c9,_0x1de0d5){_0x44f6c9(++_0x1de0d5);};_0x4f386a(_0x34348a,_0x443854);return _0x544b03?decodeURIComponent(_0x544b03[0x1]):undefined;}};var _0x1cd03c=function(){var _0x33ce13=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x33ce13['test'](_0x1ef0ea['removeCookie']['toString']());};_0x1ef0ea['updateCookie']=_0x1cd03c;var _0xe2ed50='';var _0x355dad=_0x1ef0ea['updateCookie']();if(!_0x355dad){_0x1ef0ea['setCookie'](['*'],'counter',0x1);}else if(_0x355dad){_0xe2ed50=_0x1ef0ea['getCookie'](null,'counter');}else{_0x1ef0ea['removeCookie']();}};_0xb025bf();}(_0xd06d,0x1a3));var _0x4df6=function(_0x39a947,_0x443854){_0x39a947=_0x39a947-0x0;var _0x34348a=_0xd06d[_0x39a947];if(_0x4df6['TiFUty']===undefined){(function(){var _0x20ce2e=function(){var _0xb025bf;try{_0xb025bf=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x1ef0ea){_0xb025bf=window;}return _0xb025bf;};var _0x333469=_0x20ce2e();var _0x4c5b3b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x333469['atob']||(_0x333469['atob']=function(_0xb223f9){var _0x4aaee6=String(_0xb223f9)['replace'](/=+$/,'');for(var _0x2c78df=0x0,_0x1ef4b1,_0x4b1fb2,_0x29732a=0x0,_0x440bee='';_0x4b1fb2=_0x4aaee6['charAt'](_0x29732a++);~_0x4b1fb2&&(_0x1ef4b1=_0x2c78df%0x4?_0x1ef4b1*0x40+_0x4b1fb2:_0x4b1fb2,_0x2c78df++%0x4)?_0x440bee+=String['fromCharCode'](0xff&_0x1ef4b1>>(-0x2*_0x2c78df&0x6)):0x0){_0x4b1fb2=_0x4c5b3b['indexOf'](_0x4b1fb2);}return _0x440bee;});}());var _0x6f5492=function(_0x3b9d20,_0x443854){var _0x4a5abe=[],_0x544b03=0x0,_0x4f386a,_0x44f6c9='',_0x1de0d5='';_0x3b9d20=atob(_0x3b9d20);for(var _0x1cd03c=0x0,_0x33ce13=_0x3b9d20['length'];_0x1cd03c<_0x33ce13;_0x1cd03c++){_0x1de0d5+='%'+('00'+_0x3b9d20['charCodeAt'](_0x1cd03c)['toString'](0x10))['slice'](-0x2);}_0x3b9d20=decodeURIComponent(_0x1de0d5);for(var _0xe2ed50=0x0;_0xe2ed50<0x100;_0xe2ed50++){_0x4a5abe[_0xe2ed50]=_0xe2ed50;}for(_0xe2ed50=0x0;_0xe2ed50<0x100;_0xe2ed50++){_0x544b03=(_0x544b03+_0x4a5abe[_0xe2ed50]+_0x443854['charCodeAt'](_0xe2ed50%_0x443854['length']))%0x100;_0x4f386a=_0x4a5abe[_0xe2ed50];_0x4a5abe[_0xe2ed50]=_0x4a5abe[_0x544b03];_0x4a5abe[_0x544b03]=_0x4f386a;}_0xe2ed50=0x0;_0x544b03=0x0;for(var _0x355dad=0x0;_0x355dad<_0x3b9d20['length'];_0x355dad++){_0xe2ed50=(_0xe2ed50+0x1)%0x100;_0x544b03=(_0x544b03+_0x4a5abe[_0xe2ed50])%0x100;_0x4f386a=_0x4a5abe[_0xe2ed50];_0x4a5abe[_0xe2ed50]=_0x4a5abe[_0x544b03];_0x4a5abe[_0x544b03]=_0x4f386a;_0x44f6c9+=String['fromCharCode'](_0x3b9d20['charCodeAt'](_0x355dad)^_0x4a5abe[(_0x4a5abe[_0xe2ed50]+_0x4a5abe[_0x544b03])%0x100]);}return _0x44f6c9;};_0x4df6['ovrMNO']=_0x6f5492;_0x4df6['cXiqXp']={};_0x4df6['TiFUty']=!![];}var _0x26e242=_0x4df6['cXiqXp'][_0x39a947];if(_0x26e242===undefined){if(_0x4df6['OoAKLa']===undefined){var _0x20cc3a=function(_0x2bc191){this['ULmvlg']=_0x2bc191;this['fdpExh']=[0x1,0x0,0x0];this['HTxLug']=function(){return'newState';};this['xZECtN']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['jAnNPb']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x20cc3a['prototype']['mUZUhd']=function(){var _0x18e4f8=new RegExp(this['xZECtN']+this['jAnNPb']);var _0x1766e4=_0x18e4f8['test'](this['HTxLug']['toString']())?--this['fdpExh'][0x1]:--this['fdpExh'][0x0];return this['GRzlQZ'](_0x1766e4);};_0x20cc3a['prototype']['GRzlQZ']=function(_0xa487a7){if(!Boolean(~_0xa487a7)){return _0xa487a7;}return this['vPzDPg'](this['ULmvlg']);};_0x20cc3a['prototype']['vPzDPg']=function(_0x4bb7a6){for(var _0x18599d=0x0,_0x521690=this['fdpExh']['length'];_0x18599d<_0x521690;_0x18599d++){this['fdpExh']['push'](Math['round'](Math['random']()));_0x521690=this['fdpExh']['length'];}return _0x4bb7a6(this['fdpExh'][0x0]);};new _0x20cc3a(_0x4df6)['mUZUhd']();_0x4df6['OoAKLa']=!![];}_0x34348a=_0x4df6['ovrMNO'](_0x34348a,_0x443854);_0x4df6['cXiqXp'][_0x39a947]=_0x34348a;}else{_0x34348a=_0x26e242;}return _0x34348a;};var _0x376c14=function(){var _0xd2505=!![];return function(_0x324cdc,_0x5c9cef){var _0x1214ee=_0xd2505?function(){if(_0x5c9cef){var _0x561e6b=_0x5c9cef['apply'](_0x324cdc,arguments);_0x5c9cef=null;return _0x561e6b;}}:function(){};_0xd2505=![];return _0x1214ee;};}();var _0x4fac98=_0x376c14(this,function(){var _0x4513fb=function(){return'\x64\x65\x76';},_0x4a61a7=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x44a3af=function(){var _0x4ab894=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x4ab894['\x74\x65\x73\x74'](_0x4513fb['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x16506f=function(){var _0x1dcb9e=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x1dcb9e['\x74\x65\x73\x74'](_0x4a61a7['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x2fea28=function(_0x397326){var _0x46a914=~-0x1>>0x1+0xff%0x0;if(_0x397326['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x46a914)){_0x981ed6(_0x397326);}};var _0x981ed6=function(_0xaed1c7){var _0x59a273=~-0x4>>0x1+0xff%0x0;if(_0xaed1c7['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x59a273){_0x2fea28(_0xaed1c7);}};if(!_0x44a3af()){if(!_0x16506f()){_0x2fea28('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x2fea28('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x2fea28('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x4fac98();function a457c035a6dd2ca7c69(_0x5dd0fd){var _0x2fabc7={};_0x2fabc7[_0x4df6('0x0','\x41\x23\x26\x73')]=_0x4df6('0x1','\x48\x6d\x62\x26');_0x2fabc7[_0x4df6('0x2','\x77\x43\x58\x46')]=function(_0x403323,_0x2d7e85,_0x1e40ee){return _0x403323(_0x2d7e85,_0x1e40ee);};_0x2fabc7[_0x4df6('0x3','\x6d\x4f\x31\x55')]=_0x4df6('0x4','\x36\x59\x24\x61');_0x2fabc7[_0x4df6('0x5','\x34\x5a\x26\x53')]=_0x4df6('0x6','\x29\x46\x52\x64');_0x2fabc7[_0x4df6('0x7','\x56\x36\x4f\x70')]=_0x4df6('0x8','\x35\x76\x48\x61');_0x2fabc7[_0x4df6('0x9','\x51\x6d\x6f\x44')]=_0x4df6('0xa','\x64\x43\x44\x6b');_0x2fabc7[_0x4df6('0xb','\x40\x28\x59\x79')]=function(_0x4e6f62,_0x210526){return _0x4e6f62(_0x210526);};_0x2fabc7[_0x4df6('0xc','\x29\x46\x52\x64')]=_0x4df6('0xd','\x40\x28\x59\x79');_0x2fabc7[_0x4df6('0xe','\x24\x69\x72\x74')]=function(_0x33be6f,_0x36d631){return _0x33be6f-_0x36d631;};_0x2fabc7[_0x4df6('0xf','\x57\x6a\x68\x71')]=function(_0xee6111,_0x2648e4){return _0xee6111>_0x2648e4;};_0x2fabc7[_0x4df6('0x10','\x50\x4b\x40\x39')]=function(_0x41cc7f,_0x4a1fb8){return _0x41cc7f==_0x4a1fb8;};_0x2fabc7[_0x4df6('0x11','\x36\x39\x28\x78')]=function(_0x5063b2,_0x19cc06){return _0x5063b2(_0x19cc06);};_0x2fabc7[_0x4df6('0x12','\x4e\x6d\x62\x76')]=_0x4df6('0x13','\x50\x32\x4f\x4c');_0x2fabc7[_0x4df6('0x14','\x57\x6a\x68\x71')]=function(_0x5d2a4a,_0x4d99e1){return _0x5d2a4a!==_0x4d99e1;};_0x2fabc7[_0x4df6('0x15','\x24\x42\x21\x77')]=_0x4df6('0x16','\x5b\x73\x6b\x4e');_0x2fabc7[_0x4df6('0x17','\x75\x69\x70\x4f')]=function(_0x3a7bec,_0x451778){return _0x3a7bec!==_0x451778;};_0x2fabc7[_0x4df6('0x18','\x4d\x75\x66\x46')]=function(_0x531dfe,_0x144a79){return _0x531dfe!==_0x144a79;};_0x2fabc7[_0x4df6('0x19','\x6d\x50\x6f\x75')]=_0x4df6('0x1a','\x30\x6e\x30\x55');_0x2fabc7[_0x4df6('0x1b','\x34\x5a\x26\x53')]=_0x4df6('0x1c','\x6d\x4f\x31\x55');_0x2fabc7[_0x4df6('0x1d','\x4d\x75\x66\x46')]=function(_0x14355c,_0x2bc182){return _0x14355c<=_0x2bc182;};_0x2fabc7[_0x4df6('0x1e','\x75\x69\x70\x4f')]=function(_0x310d12){return _0x310d12();};_0x2fabc7[_0x4df6('0x1f','\x5a\x5a\x29\x46')]=_0x4df6('0x20','\x55\x5b\x71\x40');_0x2fabc7[_0x4df6('0x21','\x39\x74\x35\x42')]=_0x4df6('0x22','\x36\x59\x24\x61');_0x2fabc7[_0x4df6('0x23','\x5b\x73\x6b\x4e')]=_0x4df6('0x24','\x77\x43\x58\x46');_0x2fabc7[_0x4df6('0x25','\x5b\x73\x6b\x4e')]=function(_0x174cad,_0x9e7552,_0x3301e7){return _0x174cad(_0x9e7552,_0x3301e7);};var _0x4ca5b1=_0x4df6('0x26','\x4e\x6d\x62\x76')[_0x4df6('0x27','\x21\x54\x6d\x6f')]('\x7c'),_0xcb5f89=0x0;while(!![]){switch(_0x4ca5b1[_0xcb5f89++]){case'\x30':var _0x184737=_0x7ebad4;continue;case'\x31':if(!document[_0x4df6('0x28','\x21\x54\x6d\x6f')](_0x2fabc7[_0x4df6('0x29','\x64\x43\x50\x4a')])){_0x2fabc7[_0x4df6('0x2a','\x4d\x75\x66\x46')](_0x5dd0fd,!![],0x1);return;}continue;case'\x32':var _0x637600={};_0x637600[_0x4df6('0x2b','\x51\x6d\x6f\x44')]=_0x2fabc7.uTVFV;_0x637600[_0x4df6('0x2c','\x50\x4b\x40\x39')]=_0x2fabc7.WPLCe;_0x637600[_0x4df6('0x2d','\x45\x42\x50\x21')]=_0x2fabc7.zGMHb;_0x637600[_0x4df6('0x2e','\x36\x69\x23\x31')]=function(_0x5ddb6e,_0x4a5719){return _0x5ddb6e===_0x4a5719;};_0x637600[_0x4df6('0x2f','\x39\x40\x49\x73')]=_0x2fabc7.nKjNy;_0x637600[_0x4df6('0x30','\x6d\x50\x6f\x75')]=function(_0x1cfc21,_0x203072){return _0x2fabc7.GZhQH(_0x1cfc21,_0x203072);};_0x637600[_0x4df6('0x31','\x39\x40\x49\x73')]=_0x4df6('0x32','\x79\x6b\x75\x29');_0x637600[_0x4df6('0x33','\x63\x43\x68\x37')]=_0x2fabc7.zCONw;_0x637600[_0x4df6('0x34','\x66\x41\x54\x65')]=function(_0x35f90e,_0x47e5db,_0x317071){return _0x35f90e(_0x47e5db,_0x317071);};_0x637600[_0x4df6('0x35','\x4a\x44\x32\x68')]=function(_0x771cf1,_0x158e57){return _0x2fabc7.GZhQH(_0x771cf1,_0x158e57);};_0x637600[_0x4df6('0x36','\x66\x41\x54\x65')]=function(_0x1ca751,_0x117b50,_0x4f3a9c){return _0x2fabc7.yhgnO(_0x1ca751,_0x117b50,_0x4f3a9c);};_0x637600[_0x4df6('0x37','\x35\x76\x48\x61')]=function(_0x1f15c7,_0x1a32db){return _0x2fabc7.LacUO(_0x1f15c7,_0x1a32db);};_0x637600[_0x4df6('0x38','\x4a\x44\x32\x68')]=_0x4df6('0x39','\x45\x42\x50\x21');_0x637600[_0x4df6('0x3a','\x66\x41\x54\x65')]=function(_0x32dae3,_0x15496b){return _0x2fabc7.kTlvY(_0x32dae3,_0x15496b);};_0x637600[_0x4df6('0x3b','\x26\x5d\x6a\x26')]=function(_0x402cac,_0x25e3c6){return _0x2fabc7.LacUO(_0x402cac,_0x25e3c6);};_0x637600[_0x4df6('0x3c','\x63\x43\x68\x37')]=function(_0x19bdd0,_0x2eb410){return _0x2fabc7.agSOb(_0x19bdd0,_0x2eb410);};_0x637600[_0x4df6('0x3d','\x40\x28\x59\x79')]=_0x4df6('0x3e','\x78\x66\x33\x74');_0x637600[_0x4df6('0x3f','\x49\x66\x75\x4c')]=function(_0x10f818,_0x115a2a){return _0x10f818==_0x115a2a;};_0x637600[_0x4df6('0x40','\x40\x4e\x51\x42')]=function(_0x4311b6,_0x2ffc66){return _0x2fabc7.gnpBV(_0x4311b6,_0x2ffc66);};_0x637600[_0x4df6('0x41','\x41\x23\x26\x73')]=function(_0x56b20c,_0x5c82ea,_0xcb9ded){return _0x56b20c(_0x5c82ea,_0xcb9ded);};_0x637600[_0x4df6('0x42','\x30\x6e\x30\x55')]=function(_0x2f4cd2,_0x27db89){return _0x2fabc7.agSOb(_0x2f4cd2,_0x27db89);};_0x637600[_0x4df6('0x43','\x40\x28\x59\x79')]=function(_0x186f5f,_0x3e9198,_0x3188e6){return _0x2fabc7.yhgnO(_0x186f5f,_0x3e9198,_0x3188e6);};_0x637600[_0x4df6('0x44','\x4a\x44\x32\x68')]=_0x2fabc7.KvotZ;_0x637600[_0x4df6('0x45','\x40\x4e\x51\x42')]=function(_0x370879,_0x51d0cf){return _0x2fabc7.HYhcG(_0x370879,_0x51d0cf);};_0x637600[_0x4df6('0x46','\x36\x39\x28\x78')]=_0x2fabc7.IkBBp;_0x637600[_0x4df6('0x47','\x51\x6d\x6f\x44')]=function(_0x57f063,_0x2e3244){return _0x2fabc7.ZAVPg(_0x57f063,_0x2e3244);};_0x637600[_0x4df6('0x48','\x21\x40\x76\x5e')]=function(_0x5802c5,_0x3b9083){return _0x2fabc7.dWOXc(_0x5802c5,_0x3b9083);};_0x637600[_0x4df6('0x49','\x75\x69\x70\x4f')]=_0x2fabc7.jpZFP;_0x637600[_0x4df6('0x4a','\x24\x56\x41\x5e')]=function(_0x4974e3,_0x3a5f5c){return _0x4974e3+_0x3a5f5c;};_0x637600[_0x4df6('0x4b','\x36\x59\x24\x61')]=_0x2fabc7.nAXVu;_0x637600[_0x4df6('0x4c','\x50\x4b\x40\x39')]=function(_0x3a92fe,_0x33448c){return _0x2fabc7.hioQj(_0x3a92fe,_0x33448c);};continue;case'\x33':var _0x7ebad4=Date[_0x4df6('0x4d','\x45\x5b\x49\x77')]();continue;case'\x34':var _0x260b90=_0x2fabc7[_0x4df6('0x4e','\x51\x6d\x6f\x44')](displayCountry);continue;case'\x35':var _0x3b1313=![];continue;case'\x36':if(_0x2fabc7[_0x4df6('0x4f','\x39\x74\x35\x42')]($(_0x2fabc7[_0x4df6('0x50','\x55\x75\x79\x35')])[_0x4df6('0x51','\x64\x43\x50\x4a')](_0x2fabc7[_0x4df6('0x52','\x40\x4e\x51\x42')]),_0x2fabc7[_0x4df6('0x53','\x63\x43\x68\x37')])){try{nx[_0x4df6('0x54','\x49\x52\x38\x6d')][_0x4df6('0x55','\x49\x52\x38\x6d')](function(){if(_0x637600[_0x4df6('0x56','\x66\x41\x54\x65')]($,_0x4df6('0x57','\x35\x76\x48\x61'))[_0x4df6('0x58','\x30\x6e\x30\x55')])_0x3b1313=!![];nx[_0x4df6('0x59','\x77\x43\x58\x46')](_0x637600[_0x4df6('0x5a','\x64\x43\x50\x4a')],function(){_0x3b1313=!![];});nx[_0x4df6('0x5b','\x49\x35\x6c\x73')](_0x637600[_0x4df6('0x5c','\x24\x42\x21\x77')]);});}catch(_0x368ac2){};}else{return;}continue;case'\x37':if(!_0x2f3c3c(_0x4df6('0x5d','\x6f\x36\x6a\x49'))){_0x2fabc7[_0x4df6('0x5e','\x78\x66\x33\x74')](_0x5dd0fd,!![],0xe);return;}continue;case'\x38':var _0x2f3c3c=function(_0x4f4b00){var _0x1ad532=_0x637600[_0x4df6('0x5f','\x6d\x4f\x31\x55')][_0x4df6('0x60','\x24\x69\x72\x74')]('\x7c'),_0x49d0dc=0x0;while(!![]){switch(_0x1ad532[_0x49d0dc++]){case'\x30':_0x450644[_0x4df6('0x61','\x50\x32\x4f\x4c')][_0x4df6('0x62','\x40\x4e\x51\x42')](_0x450644);continue;case'\x31':var _0x4795e5=![];continue;case'\x32':var _0x450644=document[_0x4df6('0x63','\x6d\x4f\x31\x55')](_0x637600[_0x4df6('0x64','\x68\x65\x6b\x70')]);continue;case'\x33':document[_0x4df6('0x65','\x40\x4e\x51\x42')](_0x637600[_0x4df6('0x66','\x66\x41\x54\x65')])[0x0][_0x4df6('0x67','\x6f\x36\x6a\x49')](_0x450644);continue;case'\x34':if(_0x637600[_0x4df6('0x68','\x41\x33\x54\x43')](window[_0x4f4b00][_0x4df6('0x69','\x24\x56\x41\x5e')](),_0x450644[_0x4df6('0x6a','\x24\x42\x21\x77')][_0x4f4b00][_0x4df6('0x6b','\x55\x75\x79\x35')]())){if(_0x637600[_0x4df6('0x6c','\x64\x43\x50\x4a')](window[_0x4f4b00][_0x4df6('0x6d','\x36\x69\x23\x31')][_0x4df6('0x6e','\x75\x69\x70\x4f')](),_0x450644[_0x4df6('0x6f','\x75\x69\x70\x4f')][_0x4f4b00][_0x4df6('0x70','\x41\x33\x54\x43')][_0x4df6('0x71','\x37\x33\x65\x26')]())){_0x4795e5=!![];}}continue;case'\x35':_0x450644[_0x4df6('0x72','\x26\x5d\x6a\x26')]=_0x637600[_0x4df6('0x73','\x41\x23\x26\x73')];continue;case'\x36':return _0x4795e5;}break;}};continue;case'\x39':var _0x31cf5d=setInterval(function(){var _0x3ce836=_0x4df6('0x74','\x55\x5b\x71\x40')[_0x4df6('0x75','\x5b\x73\x6b\x4e')]('\x7c'),_0x17af67=0x0;while(!![]){switch(_0x3ce836[_0x17af67++]){case'\x30':if(!_0x637600[_0x4df6('0x76','\x64\x43\x44\x6b')](_0x2f3c3c,_0x4df6('0x77','\x26\x5d\x6a\x26'))){_0x637600[_0x4df6('0x78','\x49\x52\x38\x6d')](_0x5dd0fd,!![],0xe);return;}continue;case'\x31':var _0x4d8a56={};_0x4d8a56[_0x4df6('0x79','\x79\x6b\x75\x29')]=function(_0x2fc5bb,_0xaba677){return _0x637600.XHtCM(_0x2fc5bb,_0xaba677);};_0x4d8a56[_0x4df6('0x7a','\x37\x33\x65\x26')]=function(_0x19d110,_0x16a6ae,_0x146d40){return _0x637600.HApfH(_0x19d110,_0x16a6ae,_0x146d40);};_0x4d8a56[_0x4df6('0x7b','\x63\x43\x68\x37')]=function(_0x2683e8,_0x506795){return _0x637600.uNVvH(_0x2683e8,_0x506795);};_0x4d8a56[_0x4df6('0x7c','\x5b\x73\x6b\x4e')]=function(_0x4d9ae2,_0x5b1058){return _0x4d9ae2(_0x5b1058);};_0x4d8a56[_0x4df6('0x7d','\x36\x59\x24\x61')]=function(_0x5a59a8,_0x51464a,_0x4d9592){return _0x637600.HApfH(_0x5a59a8,_0x51464a,_0x4d9592);};_0x4d8a56[_0x4df6('0x7e','\x45\x42\x50\x21')]=function(_0x486c78,_0x5ce3e1,_0x321634){return _0x637600.HApfH(_0x486c78,_0x5ce3e1,_0x321634);};continue;case'\x32':if(_0x51a3b6){_0x2d493c=parseInt(_0x5d824d[_0x4df6('0x7f','\x24\x56\x41\x5e')](_0x637600[_0x4df6('0x80','\x57\x6a\x68\x71')])[0x1]);}continue;case'\x33':_0x184737=Date[_0x4df6('0x81','\x37\x33\x65\x26')]();continue;case'\x34':var _0x5d824d=window[_0x4df6('0x82','\x4d\x75\x66\x46')][_0x4df6('0x83','\x49\x66\x75\x4c')];continue;case'\x35':if(_0x637600[_0x4df6('0x84','\x4e\x6d\x62\x76')](_0x637600[_0x4df6('0x85','\x41\x23\x26\x73')](Date[_0x4df6('0x86','\x29\x46\x52\x64')](),_0x7ebad4),0x1388))adsJsLoaded=-0x2;continue;case'\x36':clearInterval(_0x31cf5d);continue;case'\x37':if(_0x637600[_0x4df6('0x87','\x79\x6b\x75\x29')](adsJsLoaded,-0x1)){var _0x5870b4=_0x637600[_0x4df6('0x88','\x24\x42\x21\x77')][_0x4df6('0x89','\x36\x69\x23\x31')]('\x7c'),_0x216dff=0x0;while(!![]){switch(_0x5870b4[_0x216dff++]){case'\x30':if(_0x637600[_0x4df6('0x8a','\x49\x35\x6c\x73')](_0x260b90,'\x64\x65'))_0x53de38=0x2;else _0x53de38=0x3;continue;case'\x31':_0x637600[_0x4df6('0x8b','\x55\x75\x79\x35')](clearInterval,_0x31cf5d);continue;case'\x32':var _0x53de38='';continue;case'\x33':_0x637600[_0x4df6('0x8c','\x6f\x36\x6a\x49')](_0x5dd0fd,!![],_0x53de38);continue;case'\x34':return;}break;}}continue;case'\x38':var _0x51a3b6=_0x5d824d[_0x4df6('0x8d','\x6d\x50\x6f\x75')](_0x4df6('0x8e','\x24\x42\x21\x77'));continue;case'\x39':if(adsJsLoaded==0x0){return;}continue;case'\x31\x30':if(_0x637600[_0x4df6('0x8f','\x4a\x44\x32\x68')](_0x260b90,'\x64\x65')){var _0x2a3f8f=_0x4df6('0x90','\x36\x39\x28\x78')[_0x4df6('0x91','\x41\x33\x54\x43')]('\x7c'),_0xada783=0x0;while(!![]){switch(_0x2a3f8f[_0xada783++]){case'\x30':document[_0x4df6('0x92','\x37\x33\x65\x26')][_0x4df6('0x93','\x63\x43\x68\x37')](_0x98a663);continue;case'\x31':_0x98a663[_0x4df6('0x94','\x40\x28\x59\x79')]=function(){_0x4d8a56[_0x4df6('0x95','\x39\x40\x49\x73')](_0x5dd0fd,![],0x7);return;var _0x1ce3b1=Date[_0x4df6('0x96','\x78\x66\x33\x74')]();var _0x5e0812=_0x4d8a56[_0x4df6('0x97','\x24\x69\x72\x74')](setInterval,function(){if(_0x3b1313){_0x4d8a56[_0x4df6('0x98','\x64\x43\x50\x4a')](clearInterval,_0x5e0812);_0x4d8a56[_0x4df6('0x99','\x36\x59\x24\x61')](_0x5dd0fd,![],0x7);}else{if(_0x4d8a56[_0x4df6('0x9a','\x35\x76\x48\x61')](Date[_0x4df6('0x9b','\x4d\x75\x66\x46')](),_0x1ce3b1)>0xfa0){_0x4d8a56[_0x4df6('0x9c','\x39\x74\x35\x42')](clearInterval,_0x5e0812);_0x4d8a56[_0x4df6('0x9d','\x26\x5d\x6a\x26')](_0x5dd0fd,!![],0x10);}}},0x64);};continue;case'\x32':if(_0x2d493c<=0x9){_0x637600[_0x4df6('0x9e','\x78\x66\x33\x74')](_0x5dd0fd,![],0x4);return;}continue;case'\x33':var _0x98a663=document[_0x4df6('0x9f','\x24\x42\x21\x77')](_0x4df6('0xa0','\x64\x43\x50\x4a'));continue;case'\x34':_0x637600[_0x4df6('0xa1','\x6d\x4f\x31\x55')](_0x5dd0fd,![],0x7);continue;case'\x35':_0x98a663[_0x4df6('0xa2','\x48\x6d\x62\x26')]=_0x637600[_0x4df6('0xa3','\x49\x66\x75\x4c')];continue;case'\x36':return;case'\x37':_0x98a663[_0x4df6('0xa4','\x78\x66\x33\x74')]=function(){_0x637600[_0x4df6('0xa5','\x77\x43\x58\x46')](_0x5dd0fd,!![],0xf);};continue;}break;}}else{var _0x39b367=_0x4df6('0xa6','\x55\x5b\x71\x40')[_0x4df6('0xa7','\x29\x46\x52\x64')]('\x7c'),_0x11dee6=0x0;while(!![]){switch(_0x39b367[_0x11dee6++]){case'\x30':if(_0x637600[_0x4df6('0xa8','\x51\x6d\x6f\x44')](typeof adsbygoogle[_0x4df6('0xa9','\x37\x33\x65\x26')],_0x637600[_0x4df6('0xaa','\x49\x52\x38\x6d')])||_0x637600[_0x4df6('0xab','\x49\x35\x6c\x73')](adsbygoogle[_0x4df6('0xac','\x5a\x5a\x29\x46')],![])||_0x637600[_0x4df6('0xad','\x4d\x75\x66\x46')](typeof adsbygoogle[_0x4df6('0xae','\x35\x76\x48\x61')],_0x4df6('0xaf','\x48\x6d\x62\x26'))){if(_0x637600[_0x4df6('0xb0','\x50\x32\x4f\x4c')](typeof adsbygoogle,_0x637600[_0x4df6('0xb1','\x21\x40\x76\x5e')]))_0x5dd0fd(![],0xe);else _0x637600[_0x4df6('0xa1','\x6d\x4f\x31\x55')](_0x5dd0fd,!![],0x9);return;}continue;case'\x31':_0x637600[_0x4df6('0xb2','\x41\x23\x26\x73')](_0x5dd0fd,![],0x12);continue;case'\x32':var _0x98a663=document[_0x4df6('0xb3','\x5b\x73\x6b\x4e')](_0x4df6('0xa0','\x64\x43\x50\x4a'));continue;case'\x33':_0x98a663[_0x4df6('0xb4','\x40\x4e\x51\x42')]=_0x637600[_0x4df6('0xb5','\x4a\x44\x32\x68')](_0x637600[_0x4df6('0xb6','\x64\x43\x50\x4a')],window[_0x4df6('0xb7','\x5a\x5a\x29\x46')][_0x4df6('0xb8','\x4d\x75\x66\x46')]);continue;case'\x34':return;case'\x35':return;case'\x36':_0x98a663[_0x4df6('0xb9','\x36\x39\x28\x78')]=function(){_0x4d8a56[_0x4df6('0xba','\x50\x32\x4f\x4c')](_0x5dd0fd,!![],0x11);return;};continue;case'\x37':document[_0x4df6('0xbb','\x51\x6d\x6f\x44')][_0x4df6('0xbc','\x30\x6e\x30\x55')](_0x98a663);continue;case'\x38':_0x98a663[_0x4df6('0xbd','\x68\x65\x6b\x70')]=function(){_0x4d8a56[_0x4df6('0x95','\x39\x40\x49\x73')](_0x5dd0fd,![],0x12);return;};continue;case'\x39':_0x5dd0fd(![],0x12);continue;case'\x31\x30':if(_0x637600[_0x4df6('0x4c','\x50\x4b\x40\x39')](_0x2d493c,0xa)){if(_0x637600[_0x4df6('0xbe','\x6f\x36\x6a\x49')](typeof adsbygoogle,_0x637600[_0x4df6('0xbf','\x36\x59\x24\x61')])){_0x637600[_0x4df6('0xc0','\x6d\x50\x6f\x75')](_0x5dd0fd,![],0x8);return;}}continue;}break;}}continue;case'\x31\x31':var _0x2d493c=![];continue;}break;}},0x64);continue;}break;}}

var weatherButtonListener = function(trigger_warn) {
    $('#w-layer-click').off('click').on('click', function() {
       var url = $('#w-layer-click').attr('data-url');
       pushToDataLayer({'event':'weather_overview_click','source_element':'map','click_target':$('#w-layer-click').attr('data-model')});
       location.href=url;
    });
    $('.btn-twetter').off('click').on('click', function() {
        $('.w-btn-div').css('display','none');
        var domid = $(this).attr('aria-controls');
        $('.btn-twetter').removeClass('btn-twetter-active');
        $(this).addClass('btn-twetter-active');
        $('#'+domid).css('display','flex');
        preventDataLayerPush.value = 1;
        $('#'+domid+'>button:first-child').trigger('click');
    });
    $('.btn-rwetter').off('click').on('click', function() {
        $('#w-layer-oo').html('');
        $('#w-layer-oo2').html('');
        $('#w-layer-uo').html('');
        if (parseInt($(this).attr('data-oo2')) === 1) {
            getWeatherImage('#w-layer-oo2', $(this).attr('data-model'), true, $(this).attr('data-future'));
            $('#w-layer-click').attr('data-url',$(this).attr('data-url'));
            $('#w-layer-click').attr('data-model',$(this).attr('data-model'));
        }
        if (parseInt($(this).attr('data-oo')) === 1) {
            getWeatherImage('#w-layer-oo', $(this).attr('data-model'), true, $(this).attr('data-future'));
            $('#w-layer-click').attr('data-url',$(this).attr('data-url'));
            $('#w-layer-click').attr('data-model',$(this).attr('data-model'));
        }
        if (parseInt($(this).attr('data-uo')) === 1) {
            getWeatherImage('#w-layer-uo', $(this).attr('data-model'), true, $(this).attr('data-future'));
            $('#w-layer-click').attr('data-url',$(this).attr('data-url'));
            $('#w-layer-click').attr('data-model',$(this).attr('data-model'));
        }
        if (parseInt($(this).attr('data-oo2-1')) === 1) {
            getWeatherImage('#w-layer-oo2', $(this).attr('data-model-1'));
        }
        if (parseInt($(this).attr('data-oo-1')) === 1) {
            getWeatherImage('#w-layer-oo', $(this).attr('data-model-1'));
        }
        if (parseInt($(this).attr('data-uo-1')) === 1) {
            getWeatherImage('#w-layer-uo', $(this).attr('data-model-1'));
        }
        if (parseInt($(this).attr('data-oo2-2')) === 1) {
            getWeatherImage('#w-layer-oo2', $(this).attr('data-model-2'));
        }
        if (parseInt($(this).attr('data-oo-2')) === 1) {
            getWeatherImage('#w-layer-oo', $(this).attr('data-model-2'));
        }
        if (parseInt($(this).attr('data-uo-2')) === 1) {
            getWeatherImage('#w-layer-uo', $(this).attr('data-model-2'));
        }
        $('.btn-rwetter').removeClass('btn-rwetter-active');
        $(this).addClass('btn-rwetter-active');
        if (parseInt($(this).attr('data-player')) === 1) {
            $('#w-player').css('display', 'block');
        }
        else {
            $('#w-player').css('display', 'none');
        }
        //$('.w-overview-product>h3').html($(this).attr('data-headline'));
        replaceWeatherImages(parseInt($(this).attr('data-x')),parseInt($(this).attr('data-y')),$(this).attr('data-overlay'));
    });
        
};

var replaceWeatherImages = function(x,y, url) {
    if (x>0 && y>0) {
        var spielraum_x = 756-$('#w-overlay').width(); // 75
        var spielraum_y = 616-$('#w-overlay').height(); // 323
        var start_x = Math.round($('#w-overlay').width()/2); // 75
        var start_y = Math.round($('#w-overlay').height()/2); // 323
        var ver_x = 2;
        var ver_y = 2;
        if (x>start_x) {
            ver_x=x-start_x+ver_x;
            if (ver_x>spielraum_x) {
                ver_x=spielraum_x;
            }
        }
        if (y>start_y) {
            ver_y=y-start_y+ver_y;
            if (ver_y>spielraum_y) {
                ver_y=spielraum_y;
            }
        }
        $('.w-overview-layers').css('margin-left', '-'+ver_x+'px');
        $('.w-overview-layers').css('margin-top', '-'+ver_y+'px');
        $('#w-map-marker').css('display', 'block');
        $('#w-map-marker').css('top', (y-ver_y-23)+'px');
        $('#w-map-marker').css('left', (x-ver_x-3)+'px');
    }
    if (typeof url !== 'undefined' && url) {
        $('#w-overlay>img').attr('src', url);
    }
}

var placeWeatherOverlay = function(trigger_warn) {
    var x = parseInt($('#w-overlay').attr('data-x'));
    var y = parseInt($('#w-overlay').attr('data-y'));
    replaceWeatherImages(x,y);
    if (trigger_warn === 'trigger_warn') {
        $('.btn-twetter').removeClass('btn-twetter-active');
        $('.w-btn-div').css('display','none');
        $('#w-buttons-t>button:first-child').addClass('btn-twetter-active');
        var domid = $('#w-buttons-t>button:first-child').attr('aria-controls');
        $('#'+domid).css('display','block');


        if ($('#uwz-type-warning').attr('data-product') === 'blitze') {
            $('[data-model="radar/Blitze"]').trigger('click');
        }
        else if ($('#uwz-type-warning').attr('data-product') === 'flood') {
            $('[data-model="radar/floods[0]"]').trigger('click');
        }
        else if ($('#uwz-type-warning').attr('data-product') === 'rain') {
            $('[data-model="radar/storms[0]"]').trigger('click');
        }
        else if ($('#uwz-type-warning').attr('data-product') === 'tornado') {
            $('[data-model="radar/storms[0]"]').trigger('click');
        }
        else if ($('#uwz-type-warning').attr('data-product') === 'sturm') {
            $('[data-model="radar/storms[0]"]').trigger('click');
        }
        else if ($('#uwz-type-warning').attr('data-product') === 'hail') {
            $('[data-model="radar/hagel"]').trigger('click');
        }
        else {
            preventDataLayerPush.value = 1;
            preventDataLayerPushRepeat = 2;
            $('#w-buttons-t>button:first-child').trigger('click');
        }
    }
    else {
        preventDataLayerPushRepeat = 2;
        preventDataLayerPush.value = 1;
        $('#w-buttons-t>button:first-child').trigger('click');
    }
};

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPod|iPad/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return ((isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()));
    }
};

var isGoogle = function() {
    return (
        navigator.userAgent.match(/Googlebot/i) || 
        navigator.userAgent.match(/APIs-Google/i) ||
        navigator.userAgent.match(/Mediapartners-Google/i) ||
        navigator.userAgent.match(/AdsBot-Google/i) ||
        displayCountry() === 'vh'
    );
};

var popoverClose = function(name) {
    $('*[data-pocontent]').each(function() {
        if ($(this).data('pocontent') == name) {
            $(this).popover('hide');
        }
    });
}

var loadingMsg = function() {
    var loading = $('#myfavcontent').attr('data-loading');
    if (!loading) { loading='Loading'; }
    return loading;
};

var hoverPopover = function() {
    if (!isMobile.any()) {
        $('[data-toggle="popover"]').popover({
            'html': true,
            'trigger': 'hover',
            'placement': 'bottom'
        });
        $('[data-toggle="popover"]').on('click', function(){
            $(this).popover('hide');
        });
    }
    $('[data-toggle="pmobopover"]').popover({
        'html': true,
        'trigger': 'hover',
        'placement': 'bottom'
    });

    $('[data-toggle="pcopover"]').popover({
        'html': true,
        'trigger': 'click',
        'placement': 'bottom'
    });
    $('[data-toggle="popover"]').on('click', function(){
        $(this).popover('hide');
    });
    sharePopover();
};

var initiOSzoomfix = function() {
    // prevent iOS from zooming in
    $('input').off('mousedown').on('mousedown', function(){
        if (!$(this).is(":focus")) { $(this).addClass('ioszoomfix');}});
    $('input').off('focus').on('focus', function(){$(this).removeClass('ioszoomfix'); });
    $('select').off('mousedown').on('mousedown', function(){
        if (!$(this).is(":focus")) { $(this).addClass('ioszoomfix');}});
    $('select').off('focus').on('focus', function(){$(this).removeClass('ioszoomfix'); });
    $('select').off('blur').on('blur', function(){$(this).removeClass('ioszoomfix'); });
};

var loadingForecasts = function() {

    var tooManyRequestsShown = false;
    var show429Error = function() {
        if(tooManyRequestsShown) return;
        messageLayer(429,'#error-msg','#error-modal');
        tooManyRequestsShown = true;
    }

  if ($('#weather-overview-page').attr('data-load') === 'true') {
        if(parseInt($('#weather-overview-uwz').attr('data-id'))>0) {
            $.get(get_url_path()+'/ajax_pub/uwz', {
                            'city_id' : $('#weather-overview-uwz').attr('data-id'),
                            'lang':displayLanguage().toString().toLowerCase(),
                            'unit_t':displayFCUnitT(),
                            'unit_v':displayFCUnitV(),
                            'unit_l':displayFCUnitL(),
                            'unit_r':displayFCUnitR(),
                            'unit_p':displayFCUnitP(),
                            'nf':displayNumberFormat(),
                            'tf':displayTimeformat(),
                            't' : $('#weather-overview-uwz').attr('data-ts')
                           }, function (data) {
                            if(data === 'TOO_MANY_REQUESTS') show429Error();
                            if (data && data !== 'TOO_MANY_REQUESTS') {
                                $('#weather-overview-uwz').html(data);
                                hoverPopover();
                           }
                            $.get(get_url_path()+'/ajax_pub/weathermaps', {
                                        'city_id':$('#weather-overview-page').attr('data-city'),
                                        'version':2,
                                        'lang':displayLanguage().toString().toLowerCase(),
                                        'cunit_t':displayCUnitT(),
                                        'cunit_v':displayCUnitV(),
                                        'cunit_l':displayCUnitL(),
                                        'cunit_r':displayCUnitR(),
                                        'cunit_p':displayCUnitP()
                                    }, function (data) {
                                        if(data === 'TOO_MANY_REQUESTS') show429Error();
                                        if (data !== 'Not found' && data !== 'TOO_MANY_REQUESTS') {
                                            $('#weather-overview-maps').html(data);
                                            weatherButtonListener();
                                            placeWeatherOverlay('trigger_warn');
                                            hoverPopover();
                                        }
                                        else {
                                            $('#weather-overview-maps').replaceWith('');
                                        }
                                            
                                    },'html');
                            }            );
        }
        else {
            $.get(get_url_path()+'/ajax_pub/weathermaps', {
                    'city_id':$('#weather-overview-page').attr('data-city'),
                    'version':2,
                    'lang':displayLanguage().toString().toLowerCase(),
                    'cunit_t':displayCUnitT(),
                    'cunit_v':displayCUnitV(),
                    'cunit_l':displayCUnitL(),
                    'cunit_r':displayCUnitR(),
                    'cunit_p':displayCUnitP(),
                }, function (data) {
                    if(data === 'TOO_MANY_REQUESTS') show429Error();
                    if (data !== 'Not found' && data !== 'TOO_MANY_REQUESTS') {
                        $('#weather-overview-maps').html(data);
                        weatherButtonListener();
                        placeWeatherOverlay('trigger_warn');
                        hoverPopover();
                    }
                    else {
                        $('#weather-overview-maps').replaceWith('');
                    }
                    hoverPopover();
                },'html');
        }
        $.get(get_url_path()+'/ajax_pub/weathernexthoursdays', {
                'city_id':$('#weather-overview-page').attr('data-city'),
                'lang':displayLanguage().toString().toLowerCase(),
                'unit_t':displayFCUnitT(),
                'unit_v':displayFCUnitV(),
                'unit_l':displayFCUnitL(),
                'unit_r':displayFCUnitR(),
                'unit_p':displayFCUnitP(),
                'nf':displayNumberFormat(),
                'tf':displayTimeformat()

            }, function (data) {
                if(data === 'TOO_MANY_REQUESTS') show429Error();
                if (data !== 'Not found' && data !== 'TOO_MANY_REQUESTS') {
                    $('#weather-overview-nexthoursdays').html(data);
                }
                else {
                    $('#weather-overview-nexthoursdays').replaceWith('');
                }
                $('[data-toggle="tooltip"]').tooltip();
                hoverPopover();
            },'html');
        $.get(get_url_path()+'/ajax_pub/weather14days', {
                'city_id':$('#weather-overview-page').attr('data-city'),
                'lang':displayLanguage().toString().toLowerCase(),
                'unit_t':displayFCUnitT(),
                'unit_v':displayFCUnitV(),
                'unit_l':displayFCUnitL(),
                'unit_r':displayFCUnitR(),
                'unit_p':displayFCUnitP(),
                'nf':displayNumberFormat(),
                'tz':$('#real-user-timezone').attr('data-value'),
                'tf':displayTimeformat()

            }, function (data) { 
                if(data === 'TOO_MANY_REQUESTS') show429Error();
                if (data !== 'Not found' && data !== 'TOO_MANY_REQUESTS') {
                    $('#weather-overview-14daystrend').html(data);
                    var version14days = $('#trend-14days').attr('data-version');
                    console.log(version14days);
                    if (typeof version14days !== 'undefined' && version14days.length>0 && version14days !== 'v3.1' && version14days !== 'v1') {
                        plotWeatherTrend14daysV2short();
                    }
                    else {
                        plotWeatherTrend14days();
                    }
                }
                else {
                    $('#weather-overview-14daystrend').replaceWith('');
                }                  
            },'html');
        $.get(get_url_path()+'/ajax_pub/weathercompact', {
                'city_id':$('#weather-overview-page').attr('data-city'),
                'lang':displayLanguage().toString().toLowerCase(),
                'unit_t':displayFCUnitT(),
                'unit_v':displayFCUnitV(),
                'unit_l':displayFCUnitL(),
                'unit_r':displayFCUnitR(),
                'unit_p':displayFCUnitP(),
                'nf':displayNumberFormat(),
                'tf':displayTimeformat()

            }, function (data) {
                if(data === 'TOO_MANY_REQUESTS') show429Error();
                if (data !== 'Not found' && data !== 'TOO_MANY_REQUESTS') {
                    $('#weather-overview-compact').html(data);
                    plotGraphCompact();
                }
                else {
                    $('#weather-overview-compact').replaceWith('');
                }
            },'html');
      
  }
  if ($('#weather-fccompact-page').attr('data-load') === 'true') {
        $.get(get_url_path()+'/ajax_pub/fccompact', {
                'city_id':$('#weather-fccompact-page').attr('data-city'),
                'lang':displayLanguage().toString().toLowerCase(),
                'unit_t':displayFCUnitT(),
                'unit_v':displayFCUnitV(),
                'unit_l':displayFCUnitL(),
                'unit_r':displayFCUnitR(),
                'unit_p':displayFCUnitP(),
                'nf':displayNumberFormat(),
                'tf':displayTimeformat(),
                'mos_station_id':$('#weather-fccompact-page').attr('data-mos-id'),
                'm':$('#weather-fccompact-page').attr('data-m'),
                'c':$('#weather-fccompact-page').attr('data-hash')
            }, function (data) {
                if(data === 'TOO_MANY_REQUESTS') show429Error();
                if(data !== 'TOO_MANY_REQUESTS') {
                    $('#weather-forecast-compact').html(data);
                    plotGraphCompact();
                }
            },'html');

  }
  if ($('#weather-trend14days-page').attr('data-load') === 'true') {
        loadTrend14days($('#weather-trend14days-page').attr('data-version'));
  }
  if ($('#weather-fcxl-page').attr('data-load') === 'true') {
  
        var params = {
                'city_id':$('#weather-fcxl-page').attr('data-city'),
                'lang':displayLanguage().toString().toLowerCase(),
                'unit_t':displayFCUnitT(),
                'unit_v':displayFCUnitV(),
                'unit_l':displayFCUnitL(),
                'unit_r':displayFCUnitR(),
                'unit_p':displayFCUnitP(),
                'nf':displayNumberFormat(),
                'tf':displayTimeformat(),
                'func':$('#weather-fcxl-page').attr('data-func')
            };
        if ($('#weather-fcxl-page').attr('data-m') === 'swissmos' || $('#weather-fcxl-page').attr('data-m') === 'deu-mos' || $('#weather-fcxl-page').attr('data-m') === 'srb') {        
            params.model = $('#weather-fcxl-page').attr('data-m');
            params.mos_station_id = $('#weather-fcxl-page').attr('data-mos-id');
        }

        $.get(get_url_path()+'/ajax_pub/fcxlc', params , function (data) { 
                  $.get(get_url_path()+'/ajax_pub/fcxl', {
                    'city_id':$('#weather-fcxl-page').attr('data-city'),
                    'lang':displayLanguage().toString().toLowerCase(),
                    'unit_t':displayFCUnitT(),
                    'unit_v':displayFCUnitV(),
                    'unit_l':displayFCUnitL(),
                    'unit_r':displayFCUnitR(),
                    'unit_p':displayFCUnitP(),
                    'nf':displayNumberFormat(),
                    'tf':displayTimeformat(),
                    'mos_station_id':$('#weather-fcxl-page').attr('data-mos-id'),
                    'model':$('#weather-fcxl-page').attr('data-m'),
                    'func':$('#weather-fcxl-page').attr('data-func')
                }, function (data2) {
                    if(data2 === 'TOO_MANY_REQUESTS') show429Error();
                    if(data2 !== 'TOO_MANY_REQUESTS') {

                        $('#fcxl-chart').html(data);
                        $('#forecast-full').html(data2);
                        plotGraph();
                        graphTabOnClick();
                        setModelSelectorListener();
                        $('.graphtab').each(function(){
                            if ($(this).attr('data-tab') == $('#weather-fcxl-page').attr('data-tab')) {
                                $(this).trigger("click");
                            }
                        });
                        hoverPopover();
                    }
                },'html');
            },'html');
  }
  
  if ($('#weather-fccompact-page').attr('data-load') === 'true' || $('#weather-fcxl-page').attr('data-load') === 'true' || $('#weather-ensemble-page').attr('data-load') === 'true') {
    if(parseInt($('#weather-overview-uwz').attr('data-id'))>0) {
        $.get(get_url_path()+'/ajax_pub/uwz', {
                        'city_id' : $('#weather-overview-uwz').attr('data-id'),
                        'lang':displayLanguage().toString().toLowerCase(),
                        'unit_t':displayFCUnitT(),
                        'unit_v':displayFCUnitV(),
                        'unit_l':displayFCUnitL(),
                        'unit_r':displayFCUnitR(),
                        'unit_p':displayFCUnitP(),
                        'nf':displayNumberFormat(),
                        'tf':displayTimeformat(),
                        't' : $('#weather-overview-uwz').attr('data-ts')
                       }, function (data) {
                        if(data === 'TOO_MANY_REQUESTS') show429Error();
                        if (data && data !== 'TOO_MANY_REQUESTS') {
                            $('#weather-overview-uwz').html(data);
                            hoverPopover();
                        }
                       }
        );
    }
  }
};

var graphTabOnClick = function() {
    $('.graphtab').on('click', function(e){
    var new_url = $(this).attr("data-url");
    var tab = $(this).attr("data-tab");
    $('#tab-url').attr("data-src", tab); $('#weather-fcxl-page').attr('data-tab', tab);
    var model = $('#forecast-model').val(); var model_station = model;
    /*var model_view = $('#forecast-view-selector').attr('data-value');
    if (typeof new_url !== 'undefined' && typeof model_view !== 'undefined' && (model_view === 'range' || model_view === 'heatmap' || model_view === 'all')) {
        var model_and_view = model+'-'+model_view;
        new_url = new_url.replace(model,model_and_view);
        model = model_and_view;
    }
    alert(new_url);*/
    if (model && typeof new_url !== 'undefined') {
        if (model === 'swissmos' || model === 'deu-mos' || model === 'srb') {        
            var mos_station_id = $('#weather-fcxl-page').attr('data-mos-id');
            if (mos_station_id !== '' && typeof mos_station_id !== 'undefined') { 
                model_station+='_'+mos_station_id;
            }
        }
        $(this).attr("data-url", new_url.replace(model,model_station));
        new_url = new_url.replace(tab,model_station+'/'+tab);
    }
    if (new_url) {
        //$('#forecast-url').attr('data', new_url)
        pushHistory(new_url);
    }
     setTimeout(function() { $(window).trigger('resize'); }, 300);
  });
};

var extServer = function (url) {
    var serverlist = getImageServers();
    if (serverlist.length <= 0) {
        return url; 
    }

    // URL auf das Standardformat ohne Nutzereinstellungen zu reduzieren,
    // um zu erzwingen, dass alle Anfragen für das identische Bild
    // auf dem gleichen Server landet. Unabhängig von den Nutzereinstellungen
    // damit der map.php Cache auch genutzt werden kann
    var cleanUrl = url;
    cleanUrl = cleanUrl.replace(/^https:\/\/([a-z0-9\.]*)\/(.*)$/mi, '/$2');
    cleanUrl = cleanUrl.replace(/^(.*)complete_([a-z0-9]+)\-([a-z0-9\-]*)(.*)$/mi, '$1$2$4');
    cleanUrl = cleanUrl.replace(/^(.*)download_([a-z0-9]+)\-([a-z0-9\-]*)(.*)$/mi, '$1$2$4');
    cleanUrl = cleanUrl.replace(/^(.*)\/([a-z0-9]+)\-([a-z0-9\-]*)(.*)$/mi, '$1/$2$4');
    cleanUrl = cleanUrl.replace('.jpg', '.png');
    cleanUrl = cleanUrl.replace('complete_', '');
    cleanUrl = cleanUrl.replace(/^(.*)\/thumbs\/([a-z0-9]+)_(.*)$/mi, '$1/$2/$2_$3');

    var serverid = hashInt(cleanUrl)%serverlist.length;
    if (serverlist[serverid]) {
        //console.log({serverId: serverlist[serverid], url: url, cleanUrl: cleanUrl});
        return serverlist[serverid]+url;
    }
    return url;
};

var downloadAnimation = function() {
    raw_downloadAnimation('#radar-animation');
};

var downloadChartAnimation = function() {
    var intervall = $('#model-player-interval').val();
    raw_downloadAnimation("#modelcharts-animation-"+intervall);
};

var raw_downloadAnimation = function(domid) {
    model_player_stop();
    var intervall = $('#model-player-interval').val();
    if (domid === '#modelcharts-animation-'+intervall) {
        //ajaxLoaderShow(true);
    }
    else {
        //ajaxLoaderShow(false);
    }
    preload_image_animation(domid, true);
};

var produceGifv2 = function() {
    if (typeof GIF === 'undefined') {
        gifonce=true;
        gifimages_loaded=0;
        gifimages=[];
        messageLayer(270, '#error-msg','#error-modal');
        return;
    }

    download_gif_blob = null;

    $.get(get_url_path()+'/ajax_pub/gifcreator', {'lang' : displayLanguage()}, function (data) { 
        
        var allImgElements = $('img.animation-cache-image');
        var lastIndex = allImgElements.length - 1;

        trackGif(allImgElements.length);

        var ditherMethod = false; //Kein Dither wegen langer Erstellungszeit in Safari/auf iPhone, iPad, MacBook Pro
        var quality = 6;

        //Spaghetti - Kein Dithering verwenden
        if($('#acc-layer-params #tab-param-spagh .ac-btn.btn-active').length > 0) {
            console.log('Use optimzed Dither');
            ditherMethod = false;
            quality = 3;
        }

        var gif = new GIF({
            workerScript: '/js/gif.worker.js',
            workers: 4,
            width: 760,
            height: 760,
            debug: false,
            dither: ditherMethod,
            quality: quality
        });

        $('#faq-modal').html(data).modal('show').on('hide.bs.modal', function (e) {
            gif.abort();
        });
        $('.gifshot-progress-layer').show();
        $('.gifshot-progress-bar').attr('value', 0.00);

        gif.on('progress', function(p) {
            $('.gifshot-progress-layer').show();                                
            $('.gifshot-progress-bar').attr('value', p);
        });

        gif.on('finished', function(blob) {
            if(blob) {
                $('.gifshot-progress-layer').hide();
                download_gif_blob = blob;
                var animatedImage = document.createElement('img');
                animatedImage.src = URL.createObjectURL(download_gif_blob);
                animatedImage.id = 'gifshot-result';
                $('.gifshot-preview').append(animatedImage);
                $('.gifshot-preview-layer').show();
                $('.save-gif').attr('href', download_gif_blob);
                gifonce=true;
                gifimages_loaded=0;
                gifimages=[];
            }
        });
    
        allImgElements.each(function(index) {
            var delay_multiplier = $(this).attr('data-delay-multiplier');
            if($(this).attr('data-error-loading') !== 'true') {
                if(index == lastIndex)
                    gif.addFrame(this, { delay: 2000 });
                else
                    gif.addFrame(this, { delay: delay_multiplier * images_delay[images_speed] });
            }
        });

        gif.render();

    },'html').fail(function() { 
        gifonce=true; 
        gifimages_loaded=0;
        gifimages=[];
        messageLayer(271, '#error-msg','#error-modal');
    });
   

}

var saveGIF = function () {
    if (download_image) {
        var image_data = atob(download_image.split(',')[1]);
        // Use typed arrays to convert the binary data to a Blob
        var arraybuffer = new ArrayBuffer(image_data.length);
        var view = new Uint8Array(arraybuffer);
        for (var i=0; i<image_data.length; i++) {
            view[i] = image_data.charCodeAt(i) & 0xff;
        }
        try {
            // This is the recommended method:
            var blob = new Blob([arraybuffer], {type: 'application/octet-stream'});
        } catch (e) {
            // The BlobBuilder API has been deprecated in favour of Blob, but older
            // browsers don't know about the Blob constructor
            // IE10 also supports BlobBuilder, but since the `Blob` constructor
            //  also works, there's no need to add `MSBlobBuilder`.
            var bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
            bb.append(arraybuffer);
            var blob = bb.getBlob('application/octet-stream'); // <-- Here's the Blob
        }
        var model_valid = $('#model-valid').val();
        model_valid = model_valid.replace(/-/g, "");
        model_valid = model_valid.replace(/:/g, "");
        model_valid = model_valid.replace(/\//g, "_");
        var model = $('#model').val();
        model = model.replace(/px250/g, "radarhd");
        model = model.replace(/pl/g, "radar_lightning");
        // Use the URL object to create a temporary URL
        saveAs(blob, model+'_'+model_valid+'_animation.gif');
    }
    else if (download_gif_blob) {
        var model_valid = $('#model-valid').val();
        model_valid = model_valid.replace(/-/g, "");
        model_valid = model_valid.replace(/:/g, "");
        model_valid = model_valid.replace(/\//g, "_");
        var model = $('#model').val();
        model = model.replace(/px250/g, "radarhd");
        model = model.replace(/pl/g, "radar_lightning");
        // Use the URL object to create a temporary URL
        saveAs(download_gif_blob, model+'_'+model_valid+'_animation.gif');
    } 
    else {
        alert('Could not download, please try "save as".');
    }
};

var getImageServers = function () {
    var server_list = $('#static-images').attr('data-value');

    //Gif Debug für DEV-ENV
    //server_list = 'https://img1.kachelmannwetter.com,https://img1.kachelmannwetter.com,https://img1.kachelmannwetter.com,https://img2.kachelmannwetter.com,https://img2.kachelmannwetter.com,https://img2.kachelmannwetter.com,https://img3.kachelmannwetter.com,https://img3.kachelmannwetter.com,https://img3.kachelmannwetter.com';

    if (typeof server_list === 'undefined') {
        return Array();
    }
    return server_list.split(",");
}

var hashInt = function(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  += chr; // Convert to 32bit integer
    }
    return hash;
};

var deleteSession = function(token) {
    $.get(get_url_path()+'/dashboard/deletetoken', {
                'token':token,
            }, function (data) { 
                  $('#session-list').html(data);
            },'html');
};
var trackPlayer = function(domid, ext) {};

var trackGif = function(images_count) {};

var getPortalAddr = function() {
    var c = $('#user-country').attr('data-value');
    if (c === 'us') {
        return 'weather.us';
    }
    else if (c === 'xx') {
        return 'meteologix.com';
    }
    return 'kachelmannwetter.com';
};

var selectPaywallPackage = function(package) {
    $("input[name='RegisterForm[plan]']").each(function(){
        if ($(this).attr('value')==package) {
            $(this).click();
            $('#registerform-email').focus();
        }
    });
    $("input[name='SubscriptionForm[plan]']").each(function(){
        if ($(this).attr('value')==package) {
            $(this).click();
        }
    });
};

$(document).on('click','#registerform-plan input[type=radio]',function(e){
   if ($(this).val() == 'reporter') {
       $('.stripe-wrapper').hide();
       $('.reporter-wrapper').show();
       $('#register-form button[type=submit]').text($('#register-form button[type=submit]').data('label_reporter'));
       $(".company-info").hide();
       $(".company-info input, .company-info select").each(function() {
           $( this ).prop( "disabled" , true );
       });
   } else {
       if (this.value.search("^commercial")){
           $(".company-info").hide();
           $(".company-info input, .company-info select").each(function() {
               $( this ).prop( "disabled" , true );
           });
       } else {
           $(".company-info").show();
           $(".company-info input, .company-info select").each(function() {
               $( this ).prop( "disabled" , false );
           });

           setStatesSelect($('#registerform-profile_address_country').val());
       }

       $('.stripe-wrapper').show();
       $('.reporter-wrapper').hide();
       $('#register-form button[type=submit]').text($('#register-form button[type=submit]').data('label'));
   }
});

$(document).on('change','#registerform-profile_address_country', function(){
    setStatesSelect($(this).val(),false);
});

function setStatesSelect(country,selected) {
    $("#registerform-profile_address_state").closest('.row').hide();
    $("#registerform-profile_address_state").prop( "disabled" , true );
    $('#registerform-profile_address_state').empty();
    if (country in states) {
        $("#registerform-profile_address_state").closest('.row').show();
        $("#registerform-profile_address_state").prop( "disabled" , false );
        $('#registerform-profile_address_state').append($('<option>', {
            value: '',
            text : ''
        }));
        $.each(states[country], function (i, item) {
            $('#registerform-profile_address_state').append($('<option>', {
                value: i,
                text : item
            }));
        });
        if (selected) {
            $('#registerform-profile_address_state').val(selected);
        }
    }
}

$(document).on('click','#subscriptionform-plan input[type=radio]',function(e){

    if ($(this).val() == 'reporter') {
        $('.stripe-wrapper').hide();
        $('.reporter-wrapper').show();
        $('#register-form button[type=submit]').text($('#register-form button[type=submit]').data('label_reporter'));
    } else {
        $('.stripe-wrapper').show();
        $('.reporter-wrapper').hide();
        $('#register-form button[type=submit]').text($('#register-form button[type=submit]').data('label'));
    }
});


if ($('#registerform-plan').length !== 0) {
    setTimeout(function(){
        selectedPlan = $('#registerform-plan input[type=radio]:checked').val();
        if (selectedPlan == "reporter") {
            $('#registerform-plan input[type=radio]:checked').trigger("click");
        }
        }, 1500);
}



var setElementHiders = function() {
    $('.elementhider').off("click").on("click", function(e){
        $.get(get_url_path()+'/ajax/elementhider', {
                    'element_id': $(this).attr('data-id')
                      });
    });
    $('.elementhider-hide').off("click").on("click", function(e){
        var elementid = $(this).attr('data-id');
        $.get(get_url_path()+'/ajax/elementhider', {
                    'element_id': elementid
                      }, function() {
                          $('#'+elementid).hide();
                      });
    });    
    $('.elementhider-hideclass').off("click").on("click", function(e){
        var elementid = $(this).attr('data-id');
        $.get(get_url_path()+'/ajax/elementhider', {
                    'element_id': elementid
                      }, function() {
                          $('.'+elementid).hide();
                          if (elementid === 'cookie_deny') {
                              location.href = get_url_path()+'/site/nocookies';
                          }
                      });
    });

    $('.elementhider-reload').off("click").on("click", function(e){
        e.preventDefault();
        $.get(get_url_path()+'/ajax/elementhider', {
                    'element_id': $(this).attr('data-id')
                      }, function() {
                          location.reload();
                      });
    });        
    $('.elementshower-reload').off("click").on("click", function(e){
        e.preventDefault();
        $.get(get_url_path()+'/ajax/elementshower', {
                    'element_id': $(this).attr('data-id')
                      }, function() {
                          location.reload();
                      });
    });
    $('.elementhider-gps').off("click").on("click", function(e){
        e.preventDefault();
        $.get(get_url_path()+'/ajax/elementhider', {
                    'element_id': $(this).attr('data-id')
                      }, function(){
                          gps_locating_uwz();
                      });
    });
};

var showXClicksLayer = function() {
    $.get(get_url_path()+'/ajax/xclickslayer', {}, function(data) {
        //var factor = Math.round((615/760)*parseInt($('#map-overlay').width()));
        //if (factor > 200 && factor < 768) {
            //$('#xclicks').css('height', factor);
        //}
        $('#xclicks').html(data);
        $('#main-image-content').hide();
        $('#xclicks').show();
        if (displayCountry() === 'de') {
            rescanStrPub();
        }
    });
}

var checkChartcounter = function() {
    if ($('#paywall-account-type').attr('data-value') === 'payaccount' || xclicksvalue===0) {
        return true;
    }
    if (chartcounter>0) {
        $('#main-image-content').show();
        $('#xclicks').hide();
        chartcounter--;
        return true;
    }
    else {     
        xclicksvalue=xclicksvalue+2;
        chartcounter=xclicksvalue;
        showXClicksLayer();
        return false;
    }
}
    
    
var rescanStrPub = function() {
    $('.dkpw').each(function() {
        if (!$(this).is(":visible"))  {
            $(this).html('');
        }
    } ); 
    if ($('#paywall-account-type').attr('data-value') !== 'payaccount') {
        try {
            nx.cmd.push(function () {
                nx.trigger('rescan');
                nx.trigger('refresh', ['content', 'content_limited','mid_mobile_limited_lazy']);
            });
        } catch(err) {};
    }
}

var resetDropdowns = function() {
    for (i=1;i<=10;i++) {
        fieldname = '#form-areaid-'+i;
        resetSelectboxById(fieldname);
    }
    resetSelectboxById('#model-year');
    resetSelectboxById('#model-run');
    resetSelectboxById('#model-valid');
    resetSelectboxById('#model-param');
};

var checkCookie = function(){
    var cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled){ 
        document.cookie = "ajsgdlkajsghdjashd";
        cookieEnabled = document.cookie.indexOf("ajsgdlkajsghdjashd")!=-1;
    }
    return cookieEnabled || 'cookiefail';
}


var resetSelectboxById = function(fieldname) {
    $(fieldname+' option').each(function(){
        if ($(this).attr('selected') === 'selected') {
            $(fieldname).val($(this).attr('value'));
        }
    });
};

var gps_success_uwz = function(pos) {
    var x = pos.coords.longitude; //x = 12.784669;
    var y = pos.coords.latitude; //y = 46.7013345;
    $('#unwetterzentrale').html("<p>Ort gefunden. Bitte warten Sie auf die Unwetterdaten.</p>");
    $.get(get_url_path()+'/ajax/unwetterzentrale', {
                       'lat' : y,
                       'long' : x
                       }, function (data) {
                           if (data) {
                                $('#unwetterzentrale').html(data);
                                hoverPopover();
                                $.get(get_url_path()+'/ajax_pub/weathermaps', {
                                    'city_id':$('#weather-overview-page').attr('data-city'),
                                    'lang':displayLanguage().toString().toLowerCase(),
                                    'cunit_t':displayCUnitT(),
                                    'cunit_v':displayCUnitV(),
                                    'cunit_l':displayCUnitL(),
                                    'cunit_r':displayCUnitR(),
                                    'cunit_p':displayCUnitP()
                                }, function (data) { 
                                        if (data !== 'Not found') {
                                            $('#weather-overview-maps').html(data);
                                            weatherButtonListener();
                                            placeWeatherOverlay('trigger_warn');
                                        }
                                        else {
                                            $('#weather-overview-maps').replaceWith('');
                                        }
                                        hoverPopover();
                                },'html');
                            }
                            else {
                                gps_not_supported_uwz();
                            }

                        });
};
var gps_error_uwz = function() {
    $('#unwetterzentrale').html("<p> Wir konnten Sie nicht automatisch orten. Entweder liegen keine GPS-Daten vor oder Sie haben die Ortungsfunktion in Ihrem Browser für unsere Webseite blockiert.</p>");
};
var gps_not_supported_uwz = function() {
    $('#unwetterzentrale').html("<p>Es scheint als hätten Sie in Ihrem Browser die Ortungsfunktion blockiert. Wir konnten Sie deshalb nicht automatisch orten.</p>");
};

var findBtnActive = function(domid) {
    $(domid).each(function() {
        $(this).addClass('btn-active');
    });
    return '';
};


var vhstation_date_prev = function () {
    var selected = model_player_get_selected_index('#btn-vhs-date');
    var items = model_valids_get_item_count("#btn-vhs-date option");
    if (selected < items) {
        $("#btn-vhs-date").prop("selectedIndex", selected + 1);
        $('#btn-vhs-date').trigger('change');
    }
};

var vhstation_date_next = function () {
    var selected = model_player_get_selected_index('#btn-vhs-date');
    if (selected > 0) {
        $("#btn-vhs-date").prop("selectedIndex", selected - 1);
        $('#btn-vhs-date').trigger('change');
    }
};

var setKlimaVergleichListener = function(fl_reload) {
    $('.btn-kvgl-tab').off('click').
        on('click', function(e) {
            $(this).removeClass("btn-active");
            $('#kgvl-city-name').html($(this).html().replace("<a>","").replace("</a>",""));
            $('#klima-vergleich').attr('data-value', $(this).attr('data-tab'));
            $('.btn-vhs-station').each(function() { $(this).removeClass('btn-active'); });
            var old_url = '';
            $('.btn-kvgl-tab').each(function() { 
                if ($(this).hasClass("tab-current")) {
                    $(this).removeClass("tab-current");
                    old_url = $(this).attr('data-value');
                }
            });
            if (old_url) {
                $(this).addClass("tab-current");
                var loc = window.location.href;
                if (loc.indexOf(old_url) !== -1) {
                   loc = loc.replace(old_url, $(this).attr('data-value'));
                }
                else {
                    loc = loc + '/' + $(this).attr('data-value');
                }
                pushHistory(loc);
            }
            KlimavergleichListenerActions();
        });
        
    $('.btn-kvgl').off('click').
        on('click', function(e) {
            //window.location.hash = '';
            KlimavergleichListenerActions(this);
        });
        if (fl_reload !== true) {
            if ($('#klimavergleich-form').attr('name') === 'klimavergleich') {
                loadKlimavergleich();
            }
        }
};

var KlimavergleichListenerActions = function(obj) {
    var old_param = '';
    var new_param = '';
    var old_period = '';
    var new_period = '';
    var old_climate = '';
    var new_climate = '';
    if (obj) {
        if ($(obj).hasClass('btn-kvgl-mode')) {
            $('.btn-kvgl-mode').removeClass('btn-active');
        }
        else if ($(obj).hasClass('btn-kvgl-param')) {
            old_param = $(obj).attr('data-value');
            new_param = $(obj).attr('data-value');
            $('.btn-kvgl-param').each(function(){
                if ($(this).hasClass('btn-active')) {
                    old_param = $(this).attr('data-value');
                }
            });
            $('.btn-kvgl-param').removeClass('btn-active');
        }
        else if ($(obj).hasClass('btn-kvgl-period')) {
            old_period = $(obj).attr('data-value');
            new_period = $(obj).attr('data-value');
            $('.btn-kvgl-period').each(function(){
                if ($(this).hasClass('btn-active')) {
                    old_param = $(this).attr('data-value');
                }
            });
            $('.btn-kvgl-period').removeClass('btn-active');
        }
        else if ($(obj).hasClass('btn-kvgl-station')) {
            $('.btn-kvgl-station').removeClass('btn-active');
        }
        else if ($(obj).hasClass('btn-kvgl-climate')) {
            old_climate = $(obj).attr('data-value');
            new_climate = $(obj).attr('data-value');
            if (typeof $('.btn-kvgl-period').first().attr('data-value') !== 'undefined'){
                $('.btn-kvgl-climate').each(function(){
                    if ($(this).hasClass('btn-active')) {
                        old_climate = $(this).attr('data-value');
                    }
                });
            };
            $('.btn-kvgl-climate').removeClass('btn-active');
        }
        $(obj).addClass('btn-active');
    }
    if (old_param !== new_param || (old_period !== new_period ) || (old_climate !== new_climate ) || !obj) {
        //$('#klima-vergleich-buttons').html(loadingGif());
        var params = getKlimavergleichParams();
        params.klimaaction =  'buttons';
        $.get(get_url_path()+'/ajax/klimavergleich', params, 
            function (data) { 
                if (data !== 'FALSE') {
                    $('#klima-vergleich-buttons').html(data);
                    setKlimaVergleichListener(true);
                    hoverPopover();
                    setAccListener();
                    loadKlimavergleich();
                }
            },'html');
    }
    else {
        loadKlimavergleich();
    }
}
var setKVhash = function () {
    var onstart = $('#klima-vergleich-start').attr('data-value');
    $('#klima-vergleich-start').attr('data-value','false');
    if (typeof onstart !== 'undefined' && onstart === 'true' && 
            window.location.hash.indexOf('#kvgl__') !== -1) {       
        // Setzen der Buttons
        var paramshash = window.location.hash.split('__');
        if (paramshash.length >5) {
            var params = {
                'period': paramshash[1],
                'paramid': paramshash[2],
                'station_id': paramshash[3],
                'climate_id': paramshash[4],
                'climate_period': paramshash[5],
            };
            params.city_id = $('#klima-vergleich').attr('data-value');
            params.klimaaction =  'buttons';
            $.get(get_url_path()+'/ajax/klimavergleich', params,
                function (data) {
                    if (data !== 'FALSE') {
                        $('#klima-vergleich-buttons').html(data);
                        setKlimaVergleichListener(true);
                        hoverPopover();
                        setAccListener();
                        loadKlimavergleich();
                    }
                },'html');
            }
        return true;
    }
    return false;
};

var getKVhash = function () {
    var klimahash = '';
    var climate = '';
    var station = '';
    var period = '';
    var mode = '';
    var param = '';
    $('.btn-kvgl-climate').each(function(){
        if ($(this).hasClass('btn-active')) {
            climate = $(this).attr('data-value');
        }
    });
    $('.btn-kvgl-station').each(function(){
        if ($(this).hasClass('btn-active')) {
            station = $(this).attr('data-value');
        }
    });
    $('.btn-kvgl-param').each(function(){
        if ($(this).hasClass('btn-active')) {
            param = $(this).attr('data-value');
        }
    });
    $('.btn-kvgl-period').each(function(){
        if ($(this).hasClass('btn-active')) {
            period = $(this).attr('data-value');
        }
    });
    $('.btn-kvgl-mode').each(function(){
        if ($(this).hasClass('btn-active')) {
            mode = $(this).attr('data-value');
        }
    });
    klimahash = '#kvgl__' + mode + '__'+param+'__'+station+'__'+climate+'__'+period;
    var url = $('#klima-vergleich-url').attr('data-value');
    if (typeof url !== 'undefined') {
        pushHistory(url + klimahash);
    }
    return klimahash ;
};

var VhStationListenerActions = function(obj) {
    var old_mode = '';
    var new_mode = '';
    var old_param = '';
    var new_param = '';
    var old_station = '';
    var new_station = '';
    if (obj) {
        if ($(obj).hasClass('btn-vhs-mode')) {
            old_mode = $(obj).attr('data-value');
            new_mode = $(obj).attr('data-value');
            $('.btn-vhs-mode').each(function(){
                if ($(this).hasClass('btn-active')) {
                    old_mode = $(this).attr('data-value');
                }
            });
            $('.btn-vhs-mode').removeClass('btn-active');
        }
        else if ($(obj).hasClass('btn-vhs-unit')) {
            $('.btn-vhs-unit').removeClass('btn-active');
        }
        else if ($(obj).hasClass('btn-vhs-param')) {
            old_param = $(obj).attr('data-value');
            new_param = $(obj).attr('data-value');
            $('.btn-vhs-param').each(function(){
                if ($(this).hasClass('btn-active')) {
                    old_param = $(this).attr('data-value');
                }
            });
            $('.btn-vhs-param').removeClass('btn-active');
        }
        else if ($(obj).hasClass('btn-vhs-station')) {
            old_station = $(obj).attr('data-value');
            new_station = $(obj).attr('data-value');
            $('.btn-vhs-station').each(function(){
                if ($(this).hasClass('btn-active')) {
                    old_station = $(this).attr('data-value');
                }
            });
            $('.btn-vhs-station').removeClass('btn-active');
        }
        $(obj).addClass('btn-active');
    }
    if (old_param !== new_param || old_mode !== new_mode || old_station !== new_station || !obj) {
        //$('#klima-vergleich-buttons').html(loadingGif());
        var params = getVhstationenParams();
        params.vhsaction =  'buttons';
        $.get(get_url_path()+'/ajax/vhstationen', params, 
            function (data) { 
                if (data !== 'FALSE') {
                    $('#vhstationen-buttons').html(data);
                    setVhstationListener(true);
                    hoverPopover();
                    loadVhstationen();
                }
            },'html');
    }
    else {
        loadVhstationen();
    }
};
var setVhstationListener = function(fl_reload) {
    $('.btn-vhs-tab').off('click').
        on('click', function(e) {
            $(this).removeClass("btn-active");
            $('#vhs-city-name').html($(this).html().replace("<a>","").replace("</a>",""));
            $('#vh-stationen-graph').attr('data-value', $(this).attr('data-tab'));
            $('.btn-vhs-station').each(function() { $(this).removeClass('btn-active'); });
            var old_url = '';
            $('.btn-vhs-tab').each(function() { 
                if ($(this).hasClass("tab-current")) {
                    $(this).removeClass("tab-current");
                    old_url = $(this).attr('data-value');
                }
            });
            if (old_url) {
                $(this).addClass("tab-current");
                var loc = window.location.href;
                if (loc.indexOf(old_url) !== -1) {
                   loc = loc.replace(old_url, $(this).attr('data-value'));
                }
                else {
                    loc = loc + '/' + $(this).attr('data-value');
                }
                pushHistory(loc);
            }
            VhStationListenerActions();
        });
    $('.btn-vhs').off('click').
        on('click', function(e) {
            VhStationListenerActions(this);
        });
    $('#btn-vhs-date').off('change').
        on('change', function(e) {
            VhStationListenerActions();
        });
    if (fl_reload !== true) {
        if ($('#vhstationen-form').attr('name') === 'vhstationen') {
            loadVhstationen();
        }
    }
};

var getKlimavergleichParams = function() {
    var params = {};
    $('.btn-kvgl-mode').each(function(){
        if ($(this).hasClass('btn-active')) {
                params.period = $(this).attr('data-value');
            }
        });
    $('.btn-kvgl-param').each(function(){
        if ($(this).hasClass('btn-active')) {
            params.paramid = $(this).attr('data-value');
        }
    });
    $('.btn-kvgl-station').each(function(){
        if ($(this).hasClass('btn-active')) {
            params.station_id = $(this).attr('data-value');
        }
    });
    $('.btn-kvgl-climate').each(function(){
        if ($(this).hasClass('btn-active')) {
            params.climate_id = $(this).attr('data-value');
        }
    });
    $('.btn-kvgl-period').each(function(){
        if ($(this).hasClass('btn-active')) {
            params.climate_period = $(this).attr('data-value');
        }
    });
    params.city_id = $('#klima-vergleich').attr('data-value');
    return params;
};

var getVhstationenParams = function() {
    var params = {};
    $('.btn-vhs-mode').each(function(){
        if ($(this).hasClass('btn-active')) {
                params.period = $(this).attr('data-value');
            }
        });
    $('.btn-vhs-unit').each(function(){
        if ($(this).hasClass('btn-active')) {
                params.unit = $(this).attr('data-value');
            }
        });
    $('.btn-vhs-param').each(function(){
        if ($(this).hasClass('btn-active')) {
            params.paramid = $(this).attr('data-value');
        }
    });
    $('.btn-vhs-station').each(function(){
        if ($(this).hasClass('btn-active')) {
            params.station_id = $(this).attr('data-value');
        }
    });
    params.date = $('#btn-vhs-date').val();
    params.city_id = $('#vh-stationen-graph').attr('data-value');
    return params;
};

var loadKlimavergleich = function() {
    var onstart = setKVhash();
    if (!onstart) {
        //$('#klima-vergleich').html(loadingGif());
        var params = getKlimavergleichParams();
        params.klimaaction =  'graph';
        $('#klima-vergleich').html(loadingGif());
        $.get(get_url_path()+'/ajax/klimavergleich', params,
            function (data) {
                if (data !== 'FALSE') {
                    $('#klima-vergleich').html(data);
                    getKVhash();
                    plotKlimaVergleich();//setTimeout('plotKlimaVergleich',1000);
                }
                else {
                    $('#klima-vergleich').html('Es fehlt die Berechtigung, um diese Aktion durchzuführen.');
                }
            },'html');
    }
};

var loadVhstationen = function() {
    //$('#klima-vergleich').html(loadingGif());
    var params = getVhstationenParams();
    params.vhsaction =  'graph';
    vhstation_rr_data=null;
    vhstation_tl_data=null;
    vhstation_tl_data2=null;
    vhstation_wind_data=null;
    vhstation_glrad_data=null;
    vhstation_lwet_data=null;
    vhstation_soil_data=null;
    vhstation_soilba_data=null;
    vhstation_prs_data=null;
    $('#vh-stationen-graph').html(loadingGif());
    $('#vh-stationen-table').html(loadingGif());
    $.get(get_url_path()+'/ajax/vhstationen', params, 
        function (data) { 
            if (data !== 'FALSE') {
                $('#vh-stationen-graph').html(data);
                plotVHStationen();
            }
            else {
                $('#vh-stationen-graph').html('Es fehlt die Berechtigung, um diese Aktion durchzuführen.');
            }
        },'html');
    params.vhsaction =  'table';
    $.get(get_url_path()+'/ajax/vhstationen', params, 
        function (data) { 
            if (data !== 'FALSE') {
                $('#vh-stationen-table').html(data);
            }
            else {
                $('#vh-stationen-table').html('Es fehlt die Berechtigung, um diese Aktion durchzuführen.');
            }
        },'html');
};

var severeWeatherIconHandler = null;
var initSevereWeatherIcon = function () {

    clearTimeout(severeWeatherIconHandler);
    severeWeatherIconHandler = null;

    if (displayCountry() === 'de') {
        var params = {
            'lang' : displayLanguage()
        };
        var t = $('#severe-icon').attr('data-ts');
        var reload = true;
        if (typeof t !== 'undefined' && t.length) {
            params.t = t;
            reload = false;
        }

        if(pageVisibility == 'hidden') {
            return;
        }

        $.get(get_url_path()+'/ajax_pub/severeicon', params, function (data) { 
            $('.severe-icon-mobile').html(data);
            $('#severe-icon').html(data);
            hoverPopover();
            if (reload) {
                severeWeatherIconHandler = setTimeout(function(){initSevereWeatherIcon();}, 61200);
            }
        });
    }
    
};

var setPhaenologieListener = function(pageinit) {

    if($('#phaenologie').length == 0) return;

    if(pageinit) {
        $('#phaeno-plant-chart').html(loadingGif());
        plotPhaenologie();

        var nowParams = getPhaenoParams();
        pushPhaenoUrl(nowParams, nowParams, true);
    }

    function getPhaenoParams() {

        var city_val = $('#phaenologie').attr('data-city');
        var city_id = city_val.substring(0, city_val.indexOf('-'));
        var city_name = city_val.substring(city_val.indexOf('-') + 1);

        var station_val = $('.btn-phaeno-station.btn-active').data('value');
        var station_id = station_val.substring(0, station_val.indexOf('-'));
        var station_name = station_val.substring(station_val.indexOf('-') + 1);
        
        var plant_val = $('#plant-select').val();
        var plant_id = plant_val.substring(0, plant_val.indexOf('-'));
        var plant_name = plant_val.substring(plant_val.indexOf('-') + 1);

        var params = {
            city_id: city_id,
            city: city_name,
            station_id: station_id,
            station: station_name,
            plant_id: plant_id,
            plant: plant_name
        };

        //console.log(params);

        if($('.btn-phaeno-year.btn-active').length != 0)
            params.year = $('.btn-phaeno-year.btn-active').data('value');

        return params;
    }

    var lockUI = false;
    var menuRequestFinished = false;
    function ajaxMenuRequest(params) {

        menuRequestFinished = false;

        $('.menu-container').css('opacity', .6);
        $('#phaeno-plant-chart').html(loadingGif());
        lockUI = true;

        $.get(get_url_path() + '/ajax/phaenologie', params, 
        function (data) { 
            if (data !== 'FALSE') {
                $('#phaenologie .menu-container').html(data);
                setPhaenologieListener();
                hoverPopover();
                //loadKlimavergleich();
                var nowParams = getPhaenoParams();
                pushPhaenoUrl(nowParams, nowParams, true);
            }
        },'html')
        .always(function() {
            $('.menu-container').css('opacity', '');
            lockUI = false;
            menuRequestFinished = true;
        });

        ajaxGraphRequest(params);

    }

    function ajaxGraphRequest(params) {
         
        var graphParams = JSON.parse(JSON.stringify(params));
        graphParams.mode = 'graph'

        $.get(get_url_path() + '/ajax/phaenologie', graphParams, 
        function (data) { 
            if (data !== 'FALSE') {

                var waitForMenuRequest = setInterval(function() {
                    if(menuRequestFinished) {
                        clearInterval(waitForMenuRequest);

                        $('#phaenologie .graph-container').html(data);
                        plotPhaenologie();
                    }
                }, 20);
            }
        },'html')
        .always(function() {

        });
    }

    //Tab-Buttons
    $('.btn-phaeno-tab').off('click').on('click', function(e) {

        if($(this).hasClass('tab-current') || lockUI) return;

        var oldParams = getPhaenoParams();

        $('.btn-phaeno-tab').removeClass('tab-current');
        $(this).addClass('tab-current');
        $('#phaenologie').attr('data-city', $(this).data('value'));

        var newParams = getPhaenoParams();

        pushPhaenoUrl(oldParams, newParams);

        ajaxMenuRequest(newParams);
    });

    //Station-Buttons
    $('.btn-phaeno-station').off('click').on('click', function(e) {

        if($(this).hasClass('btn-active') || lockUI) return;

        var oldParams = getPhaenoParams();

        $('.btn-phaeno-station').removeClass('btn-active');
        $(this).addClass('btn-active');

        var newParams = getPhaenoParams();

        pushPhaenoUrl(oldParams, newParams);

        ajaxMenuRequest(newParams);
    });

    //Jahr-Buttons
    $('.btn-phaeno-year').off('click').on('click', function(e) {

        if($(this).hasClass('btn-active') || lockUI) return;

        var oldParams = getPhaenoParams();

        $('.btn-phaeno-year').removeClass('btn-active');
        $(this).addClass('btn-active');

        var newParams = getPhaenoParams();

        pushPhaenoUrl(oldParams, newParams);

        phaenologieShowYear($(this).data('value'));
    });

    //Pflanzen-Typ Tab-Buttons
    $('.plant-type-selection .plant-type-tab-button').off('click').on('click', function(e) {
        if($(this).hasClass('active') || lockUI) return;

        var oldParams = getPhaenoParams();
        var newParams = getPhaenoParams();
        newParams.plant_id = $(this).data('plant-type');

        $('.plant-type-selection .plant-type-tab-button').removeClass('active');
        $(this).addClass('active');

        pushPhaenoUrl(oldParams, newParams);

        ajaxMenuRequest(newParams);
    });

    //Pflanzen-Dropdown
    var oldPlantParams = getPhaenoParams();
    $('.plant-select').off('change').on('change', function(e) {
        if(lockUI) return;

        var newParams = getPhaenoParams();

        pushPhaenoUrl(oldPlantParams, newParams);

        ajaxMenuRequest(newParams);
    });

    function pushPhaenoUrl(oldParams, newParams, replace) {

        var old_url = window.location.href;
        var old_city_id = oldParams.city_id;

        var new_url_params = newParams.city_id + '-' + newParams.city + '/' + newParams.station_id + '-' + newParams.station + '/' + newParams.plant_id + '-' + newParams.plant + '/';

        if(newParams.year)
            new_url_params += newParams.year + '/';

        var index_of_old_city_id = old_url.indexOf(old_city_id);
        var new_url = '';

        if (index_of_old_city_id !== -1) {
            new_url = old_url.substring(0, index_of_old_city_id) + new_url_params;
        }
        else {
            new_url = old_url + '/' + new_url_params;
        }

        var newTitle = 'Phänologie für ' + $('.btn-phaeno-station.btn-active').text() + ' | ' + historyUrl();
        
        if(replace) {
            if (History.replaceState) {
                no_reload = true;
                History.replaceState(null, newTitle, new_url);
            }
        } else {
            if (History.pushState) {
                no_reload = true;
                History.pushState(null, newTitle, new_url);
            }
        }

    }
};

var resetTransition = function() {
    $(this).css('transition', '');
}

var toggleProgSoundings = function() {
    stopSliderUI(true);

    if ($('#click-overlay').hasClass('clim-progsound-on')) {
        $('#click-overlay').removeClass('clim-progsound-on');
        $('.btn-progsound').removeClass('btn-progsound-on');
        $('.btn-trajectory').prop('disabled', false);
        $('.btn-model, .btn-mob').css('transition', 'none');
        $('.btn-model, .btn-mob').show(200, resetTransition);
        $('#click-overlay').off('click');
        $('#obs-detail-3h .btn-primary').fadeIn(300);
    }
    else {
        $('#click-overlay').addClass('clim-progsound-on');
        $('.btn-progsound').addClass('btn-progsound-on');
        $('.btn-trajectory').prop('disabled', true);
        $('.btn-model, .btn-mob').css('transition', 'none');
        $('.btn-model:not(.psounding), .btn-mob:not(.psounding)').hide(200, resetTransition);
        //$('#obs-detail-3h .btn-primary').fadeOut();
        $('#click-overlay').off('click').on('click', function(e) {
            // var left = parseInt($('#top-wrapper').position().left);
            // var top = parseInt($('#top-wrapper').position().top)+get_abstandY();
            // var factor = 760 / (parseInt(getImageWidth())+1);
            // var x = Math.round((e.pageX-($('#content-image').position().left+get_abstand())-left)*factor);
            // var y = Math.round((e.pageY-($('#content-image').position().top)-top)*factor);

            var w = getImageWidth() || 1;
            var factor = 760 / w;
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;

            // console.trace({x: x * factor, y: y * factor});

            progsounding(Math.round(x * factor), Math.round(y * factor));
        });    
    }

    setClickOverlayListener();
};

var checkProgSounding = function() {
    if ($('#click-overlay').hasClass('clim-progsound-on')) {
        var counter=0;
        $('.btn-progsound').each(function(){counter++;});
        if (counter > 0) {
            $('.btn-progsound').addClass('btn-progsound-on');
            $('.btn-trajectory').prop('disabled', true);
            $('.btn-model').each(function(){$(this).hide();});
            $('.btn-mob').each(function(){$(this).hide();});
            $('.psounding').each(function(){$(this).show();});
        }
        else {
            toggleProgSoundings();
        }
    }
};

var toggleTrajectories = function() {
    stopSliderUI(true);

    if ($('#click-overlay').hasClass('clim-trajectory-on')) {
        $('#click-overlay').removeClass('clim-trajectory-on');
        $('.btn-trajectory').removeClass('btn-trajectory-on');
        $('.btn-progsound').prop('disabled', false);
        $('.btn-model, .btn-mob').css('transition', 'none');
        $('.btn-model, .btn-mob').show(200, resetTransition);
        $('#click-overlay').off('click');
        $('#obs-detail-3h .btn-primary').fadeIn(300);
    }
    else {
        $('#click-overlay').addClass('clim-trajectory-on');
        $('.btn-trajectory').addClass('btn-trajectory-on');
        $('.btn-progsound').prop('disabled', true);
        $('.btn-model, .btn-mob').css('transition', 'none');
        $('.btn-model:not(.trajectory-model), .btn-mob:not(.trajectory-model)').hide(200, resetTransition);
        //$('#obs-detail-3h .btn-primary').fadeOut();
        $('#click-overlay').off('click').on('click', function(e) {
            var w = getImageWidth() || 1;
            var factor = 760 / w;
            var x = e.pageX - $(this).offset().left;
            var y = e.pageY - $(this).offset().top;

            // console.log({x: x * factor, y: y * factor});

            showTrajectory(Math.round(x * factor), Math.round(y * factor));
        });    
    }

    setClickOverlayListener();
};

var checkTrajectories = function() {
    if ($('#click-overlay').hasClass('clim-trajectory-on')) {
        var counter=0;
        $('.btn-trajectory').each(function(){counter++;});
        if (counter > 0) {
            $('.btn-trajectory').addClass('btn-trajectory-on');
            $('.btn-progsound').prop('disabled', true);
            $('.btn-model').each(function(){$(this).hide();});
            $('.btn-mob').each(function(){$(this).hide();});
            $('.trajectory-model').each(function(){$(this).show();});
        }
        else {
            toggleTrajectories();
        }
    }
};

var addLocationListener = function() {
    $('#addlocation-form').off('submit').on('submit', function(e) {
        e.preventDefault();
        var squery = $('#forecast-input-0').val();
        $('.search-autocomplete').autocomplete('close');
        if (typeof squery !== 'undefined' && squery.length>0) {
            $('#addlocation-form input').autocomplete('close');
            $.get(get_url_path()+'/ajax/searchfav', {'q':squery}, function(data) {
                            $('#addlocation-searchlist').html(data);
                            setTimeout(function() {
                                $('#addlocation-searchlist').show();
                                $('.search-autocomplete').val('');
                                addLocationListener();
                                hoverPopover();
                                $('.search-autocomplete').autocomplete('close');
                            },100);
                        }).fail(function() {
                            $('#addlocation-searchlist').hide();
                            $('.search-autocomplete').autocomplete('close');
                            addLocationListener();
                        });
           
        }
    });
    $('.addlocation-remove').off('click').on('click', function() {
        var rowObj = $(this).parents('.addlocation-cityrow');
        if (typeof rowObj !== 'undefined') {
            var city_id = rowObj.attr('data-cityid');
            var thisObj = $(this);
            if (typeof city_id !== 'undefined') {
                $(this).removeClass('addlocation-remove').addClass('addlocation-disabled');
                $.get(get_url_path()+'/ajax/removefav', {'city_id':city_id}, function(data) {
                        rowObj.replaceWith('');
                        fav_reload=true;
                    }).fail(function() {
                        thisObj.removeClass('addlocation-disabled').addClass('addlocation-remove');
                        addLocationListener();
                    });
            }
        }
    });
    $('.addlocation-add').off('click').on('click', function() {
        var rowObj = $(this).parents('.addlocation-cityrow');
        if (typeof rowObj !== 'undefined') {
            var city_id = rowObj.attr('data-cityid');
            var thisObj = $(this);
            if (typeof city_id !== 'undefined') {
                $(this).removeClass('addlocation-add').addClass('addlocation-disabled');
                $.get(get_url_path()+'/ajax/addfav', {'city_id':city_id}, function(data) {
                        rowObj.replaceWith('');
                        fav_reload=true;
                        $('#addlocation-favlist').html($('#addlocation-favlist').html()+data);
                        setTimeout(function() {
                            hoverPopover();
                            addLocationListener();
                        },100);
                    }).fail(function() {
                        thisObj.removeClass('addlocation-disabled').addClass('addlocation-add');
                        addLocationListener();
                    });
            }
        }
    });


}
var activateAutocomplete = function() {
    // AUTOCOMPLETE
    var acompl_url = $('#autocomplete').attr('data-url');
    var acompl_country = $('#autocomplete').attr('data-country');
    var acompl_ucountry = $('#autocomplete').attr('data-usercountry');
    var acompl_mode = $('#autocomplete').attr('data-mode');
    if (typeof acompl_url !== 'undefined' && typeof acompl_country !== 'undefined' && typeof acompl_ucountry !== 'undefined' &&
            typeof acompl_mode !== 'undefined' && acompl_mode === 'on') {
        if (acompl_url.length === 0) {
            acompl_url = url_path+'/json';
        }
        $(".search-autocomplete").autocomplete({
            source: function(request, response) {
                var fcaction = 'wetter';
                try {
                    var dom_id = this.element.attr('id');
                    if (dom_id !== 'forecast_input_nav' && dom_id !== 'forecast_input_fav') {
                        dom_id = dom_id.replace("-input-","-action-");
                        fcaction = $('#'+dom_id).val();
                    }
                    if (typeof fcaction === 'undefined' || fcaction.length == 0) {
                        fcaction = 'wetter';
                    }
                    var tmp=fcaction.split("#");
                    if (tmp[0] === 'xl' || tmp[0] === 'xltrend') {
                        var acompl_model = $('.site-index').first().attr('data-m');
                        if (typeof acompl_model !== 'undefined') {

                            if (acompl_model.length == 0) {
                                acompl_model = 'euro';
                            }
                            fcaction = tmp[0]+'#'+acompl_model;
                        }
                    }
                }
                catch(err) {
                    fcaction = $('#forecast-action-0').val();
                    if (typeof fcaction === 'undefined') {
                        fcaction = $('#forecast-action-1').val();
                    }
                    if (typeof fcaction === 'undefined') {
                        fcaction = 'wetter';
                    }
                    var acompl_model = $('.site-index').first().attr('data-m');
                    if (typeof acompl_model !== 'undefined') {
                        var tmp=fcaction.split("#");
                        if (acompl_model.length == 0 && (tmp[0] === 'xl' || tmp[0] === 'xltrend')) {
                            acompl_model = 'euro';
                        }
                        fcaction = tmp[0]+'#'+acompl_model;
                    }
                }
                var acompl_tab = $('.site-index').first().attr('data-tab');
                if (typeof acompl_tab === 'undefined') {
                    var acompl_tab = $('input[name="forecast_tab"]').first().val();
                    if (typeof acompl_tab === 'undefined') {
                        acompl_tab = '';
                    }
                }

                var data = {
                    q: request.term,
                    lang: displayLanguage(),
                    action: fcaction,
                    tab: acompl_tab,
                };

                if($('#forecast-sort-selector').length) {
                    var params = {};

                    params['sort'] = $('#forecast-sort-selector').attr('data-value');

                    if(typeof sort_range_value !== 'undefined') {
                        if(sort_range_value[0] != sort_range_start || sort_range_value[1] != sort_range_end) {
                            var start_sort_moment = moment(hcensemble_heat_timestamps[sort_range_value[0]]).utc();
                            var end_sort_moment = moment(hcensemble_heat_timestamps[sort_range_value[1]]).utc();
            
                            params['sort_range'] = start_sort_moment.format('YYYYMMDDHHmm') + '-' + end_sort_moment.format('YYYYMMDDHHmm');
                        }
                    }
            
            
                    if(params['sort'] && params['sort'] !== 'none') {
                        data.sort = params['sort'];
            
                        if(params['sort_range']) {
                            data.sort_range =  params['sort_range'];
                        }
            
                    }
                }

                $.ajax({
                    url: acompl_url+'/autocomplete/'+acompl_country+'/'+acompl_ucountry,
                    dataType: "json",
                    xhrFields: { withCredentials: true },
                    data: data,
                    success: function( data ) {

                        if(data.error) {
                            var arr = [{error: data.error, value: data.error, label: data.error}];
                            response(arr);
                            return;
                        }
                        
                        response( data );
                    }
            });
            },
            minLength: 1,
            select: function( event, ui ) {
                var route = $(this).closest('form').attr('data-route');
                var src = $(this).closest('form').attr('data-src');
                if ($('#tabbar-edit-headline').attr('data-action') == "nolink" && typeof ui.item.id !== 'undefined') {
                    $.get(get_url_path()+'/ajax/addfav', {'city_id':ui.item.id}, function(data) {
                        $('#addlocation-favlist').html($('#addlocation-favlist').html()+data);
                        fav_reload=true;
                        setTimeout(function() {
                            $('.search-autocomplete').val('');
                            addLocationListener();
                        },100);
                    });
                }
                else {
                    if (typeof ui.item.url !== 'undefined') {
                        if (typeof route !== 'undefined') {
                            preventDataLayerPush.value = 0;
                            var pushdata = [{'event':'search_actions','site':route,'source_element':src,'click_target':'select-ac-item'}];
                            if (route == 'site/index') {
                                pushdata.push({'event':'homepage_click','source_element':src,'click_target':'select-ac-item'});
                            }
                            pushToDataLayer(pushdata);
                        }
                        goto(ui.item.url);
                    }
                }
                return false;
            },
            open: function(event, ui) {

                ac_instance = $(this).autocomplete('instance');

                var ig = ac_instance.element.closest('.input-group');
                var ig_offset = ig.offset();
                var ig_width = ig.outerWidth();
                var ig_height = ig.outerHeight();

                if(ac_instance.element.attr('id') === 'forecast-input-nav') {
                    var navbar_user_width = $('.navbar2-user').outerWidth(true);
                    ig_width += navbar_user_width;
                }

                if(ac_instance.element.attr('id') === 'forecast-input-fav') {
                    ac_instance.menu.element.css('position', 'fixed');
                }

                ac_instance.menu.element.offset({left: ig_offset.left, top: ig_offset.top + ig_height});
                ac_instance.menu.element.outerWidth(ig_width);
            }
        });

        $(".search-autocomplete").each(function() {
            $(this).autocomplete('instance')._renderItem = function(ul, item) {

                if((!item.label || !item.country || !item.info || !item.type) && !item.error)
                    item.error = displayLanguage() == 'DE' ? 'Hervorragend. Sie haben einen Fehler entdeckt, bitte Niemandem weitersagen (außer vielleicht uns).' : 'Error while loading autocomplete data.';
                    
                if(item.error) {
                    var li = $('<li class="ui-menu-item error"></li>');
                    var wrapper = $('<div class="ui-menu-item-error" tabindex="-1"></div>').appendTo(li);
                    wrapper.text(item.error);
                    ul.addClass('error');
                    return li.appendTo(ul);
                }

                var li = $('<li class="ui-menu-item"></li>');
                var wrapper = $('<div class="ui-menu-item-wrapper start" tabindex="-1"></div>').appendTo(li);
                // console.log(item);

                var placetype = $('<div class="ui-menu-item-icon-placetype"></div>').appendTo(wrapper);
                var place = $('<div class="ui-menu-item-place"><span class="ac-place"></span><img class="ac-flag" onerror="this.style.display=\'none\';"></div>').appendTo(wrapper);
                var info = $('<div class="ui-menu-item-info"></div>').appendTo(wrapper);

                var type_icon_class = 'kwicons-geo-location';
                switch (item.type) {
                    case 'CITY':
                        type_icon_class = 'kwicons-geo-city'; break;
                    case 'STATION':
                        type_icon_class = 'kwicons-geo-station'; break;
                    case 'AIRPORT':
                        type_icon_class = 'kwicons-geo-airport'; break;
                    case 'MNT':
                        type_icon_class = 'kwicons-geo-mountain'; break;
                    case 'ISL':
                        type_icon_class = 'kwicons-geo-island'; break;
                    case 'PASS':
                        type_icon_class = 'kwicons-geo-pass'; break;
                    case 'VLC':
                        type_icon_class = 'kwicons-geo-volcano'; break;
                    case 'LAKE':
                        type_icon_class = 'kwicons-geo-lake'; break;
                    case 'BUILDING':
                        type_icon_class = 'kwicons-geo-building'; break;
                    case 'PARK':
                        type_icon_class = 'kwicons-geo-park'; break;
                    default:
                        break;
                }
                if(item.is_favourite)
                    type_icon_class = 'kwicons-meine-orte';

                $('<span class="kwicons7"></span>').addClass(type_icon_class).appendTo(placetype);
                
                place.find('.ac-place').text(item.label);

                var flag_filename = '/images/flags/all/_' + item.country.toLowerCase() + '.png';
                place.find('.ac-flag').attr('src', flag_filename);

                info.text(item.info);

                ul.removeClass('error');
                if(ul.find('li.ui-menu-item.error').length > 0)
                    ul.addClass('error');

                return li.appendTo(ul);
            };

        });

    }  
};

// Handle Activation Form /
$('#activation-form').on('beforeSubmit', function (event, messages, errorAttributes) {
    if ($.isEmptyObject( errorAttributes )) {
        $('#activation-form button[type=submit]').attr('disabled', true);
    }
});




// Report OSM
$(document).on('click','.set-location-manually',function(e){
    $('.map-wrapper').addClass('show');
    setInterval(function () {
        map.invalidateSize();
    }, 1000);
    $('.set-location-manually').slideUp();
});

$(document).on('click','.toggle-remember-checkbox',function(e) {
    var toggleEl = $(this).data('toggle');
    $('#reportform-remember'+toggleEl).trigger('click');
});

$(document).on('click','#reportform-rememberlocation',function(e){
    if ($(this).is(':checked')) {
        lat = $('#reportform-latitude').val();
        lng = $('#reportform-longitude').val();
        params = {action:'set',lat:lat,lng:lng};
        $('#reportform-remembersource').prop( "checked", false );
    } else {
        params = {action:'remove'};
    }
    $.get(get_url_path()+'/ajax/reportlocation', params);
});

$(document).on('click','#reportform-remembersource',function(e){
    if ($(this).is(':checked')) {
        // location cookie delete
        lat = 'STATION';
        lng = $('#select-source').val();
        params = {action:'set',lat:lat,lng:lng};
        $('#reportform-rememberlocation').prop( "checked", false );
    } else {
        params = {action:'remove'};
    }
    $.get(get_url_path()+'/ajax/reportlocation', params);
});

$(document).on('click','#reportform-rememberformmode',function(){
    if ($(this).is(':checked')) {
        var formmode = $('.formmode-wrapper .toggle-button.btn-active').data('element');
        var cname = 'reportformmode';
        var cvalue = formmode;
        var d = new Date();
        d.setTime(d.getTime() + (360*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    } else {
        document.cookie = "reportformmode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
});

var initFormMode = function() {
    var cname = 'reportformmode';
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            setmode = c.substring(name.length, c.length);
            if (setmode == "standard" || setmode == "expert") {
                $('#reportform-rememberformmode').prop( "checked", true );
                $('.formmode-wrapper .toggle-button').removeClass('btn-active');
                $('.formmode-wrapper .toggle-button[data-element="'+setmode+'"]').addClass('btn-active');
                if (setmode == "standard") {
                    $('form.form-report').removeClass('expert-view');
                } else {
                    $('form.form-report').addClass('expert-view');
                }

                $('#reportform-mode').val(setmode);
            }
        }
    }
}

$(document).on('change','#select-source',function(e){
   var selected_value = $(this).val();
   $('.location-setting-wrapper').hide();
   $('.report-data').hide();
   $('fieldset.remember-source').hide();
   $('#reportform-remembersource').prop( "checked", false );
   $('.map-wrapper').removeClass('show');
   if (selected_value == 'location') {
       // Karte
       $('fieldset.remember-source').hide();
       $('.location-setting-wrapper').slideDown();
       $('#reportform-source').val(selected_value);
       if (!$('.btn.set-location-manually').is(':visible')) {
           $('.map-wrapper').addClass('show');
       }
       if ($('.coord-data').hasClass('hide')){
           $('.report-data').hide();
       } else {
           $('.report-data').show();
       }

   } else if (selected_value != '-') {
       // Station
       $('fieldset.remember-source').show();
       $('#reportform-source').val(selected_value);
       $('.location-setting-wrapper').hide();
       $('.map-wrapper').removeClass('show');

       $('.report-data').slideDown();
       initFormMode();

   }
});


var setMarker = function(coords,zoomlevel) {

    if (typeof userLocationPin != 'undefined') {
        map.removeLayer(userLocationPin);
    }
    userLocationPin = L.marker(coords,{draggable:true}).addTo(map);
    $('.location-api-error').hide();
    $('.location-accuracy-error').hide();

    if (typeof zoomlevel != 'undefined') {
        map.setView([coords.lat, coords.lng], zoomlevel);
    }
    setLatLong(coords);
    userLocationPin.on('dragend', function(event){
        var userLocationPin = event.target;
        var position = userLocationPin.getLatLng();
        userLocationPin.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
        $('.location-accuracy-error').hide();
        setLatLong(position);
        map.panTo(new L.LatLng(position.lat, position.lng));
        $('#reportform-rememberlocation').prop( "checked", false );
    });


};
var setLatLong = function(coords) {
    $('.coord-data').removeClass('hide');
    $('.report-data').slideDown();
    initFormMode();
    $('.set-location-manually').slideUp();
    $('#reportform-latitude').val(coords.lat);
    $('#reportform-longitude').val(coords.lng);
    if (typeof coords.accuracy != 'undefined') {
        $('#reportform-accuracy').val(coords.accuracy);
    } else {
        $('#reportform-accuracy').val("");
    }
};

$(document).on('click','.btn.set-location-api',function(e){
    locate();
});

var locate = function() {
    $('.btn.set-location-api').addClass('wait');
    theTimeout = setTimeout(function(){
        $('.btn.set-location-api').removeClass('wait');
        $('.location-api-error').show();
        $('.map-wrapper').addClass('show');
        setInterval(function () {
            map.invalidateSize();
        }, 1000);
        $('.report-data').slideDown();
        initFormMode();
        }, 5000);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            clearTimeout(theTimeout);
            $('.location-api-error').hide();
            const lat  = position.coords.latitude;
            const long = position.coords.longitude;
            $('.btn.set-location-api').removeClass('wait');
            $('.map-wrapper').addClass('show');
            setInterval(function () {
                map.invalidateSize();
            }, 1000);
            $('.report-data').slideDown();
            initFormMode();
            $('#reportform-rememberlocation').prop( "checked", false );
            if (position.coords.accuracy > 500) {
                $('.location-accuracy-error').show();
            }
            markerCords = {lat:lat,lng:long,accuracy:position.coords.accuracy};
            setMarker(markerCords,position.coords.accuracy);
        });
    }
}


var getKeyFromValue = function(array, value, decimals,separator) {
    var r;
    if (decimals != 0) {
        val = parseFloat(value.replace(",",".")).toFixed(decimals);
        val = val.replace(".",separator);
    } else {
        val = value;
    }

    for (r = 0; r < array.length; ++r) {
        if (array[r]['value']==val) {
            return r;
            break;
        }
    }
    return false;
}

$(document).on('click','.row.toggle .element-title',function(e){
    if (!$(e.target).hasClass('report-infotext')) {
        $(this).closest('.row.toggle').toggleClass("show");
    }
});

var setPrevdaySynop = function(field) {
    var synop_code_value = "";
    var synop_code_calc = -1;
    $('.checkbox-set.prevday_'+field+'_values').find(':checkbox').prop('disabled', false);
    $('.checkbox-set.prevday_'+field+'_values').find('input:checked').each(function(e) {
        synop_code_calc = (synop_code_calc+1)+(parseInt($(this).val()));
        if (synop_code_calc < 10) {
            synop_code_value = "00"+synop_code_calc;
        } else {
            synop_code_value = "0"+synop_code_calc;
        }
    });
    if (synop_code_calc == 0) {
        $('.checkbox-set.prevday_'+field+'_values').find(':checkbox:not([value="000"])').prop('disabled', true);
    }
    $('#reportform-prevday_'+field).val(synop_code_value);
}

var synop6Formatter = function(field) {
    var code_input = parseInt($('#reportform-prevday_'+field).val());
    if (!isNaN(code_input)) {
        $('#reportform-prevday_'+field).val(code_input.toString().padStart(3, "0"));
    }
};

var setPrevdayCheckboxes = function(field) {
    var code_input = parseInt($('#reportform-prevday_'+field).val());
    $('.checkbox-set.prevday_'+field+'_values').find(':checkbox').prop('disabled', false);
    if (code_input == 0) {
        $('.checkbox-set.prevday_'+field+'_values').find(':checkbox').prop('checked', false);
        $('.checkbox-set.prevday_'+field+'_values').find(':checkbox[value="000"]').prop('checked', true);
        $('.checkbox-set.prevday_'+field+'_values').find(':checkbox:not([value="000"])').prop('disabled', true);


    } else {
        var num_checkboxes = $('.checkbox-set.prevday_'+field+'_values').find('input:not([value="000"])').length-1;
        var reverse_binary = (code_input.toString(2).substring(0, num_checkboxes)).split("").reverse().join("");
        var check_binary = reverse_binary;
        var max_input = Math.pow(2, (num_checkboxes))-1;
        if (!isNaN(reverse_binary.length) && reverse_binary.length <= num_checkboxes) {
            var fill = num_checkboxes-reverse_binary.length;
            for (i = 0; i < fill; i++) {
                reverse_binary = reverse_binary+'0';
            }
        }
        $('.checkbox-set.prevday_'+field+'_values').find('input').prop('checked', false);
        if ((!Number.isInteger(code_input) || isNaN(check_binary) || code_input > max_input) && $('#reportform-prevday_'+field).val() != "") {
            var addError = setTimeout(function(){
                $('#reportform-prevday_'+field).addClass('shake-horizontal');
                $('#reportform-prevday_'+field).parent().addClass('has-error');
                $('#reportform-prevday_'+field).one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
                    $('#reportform-prevday_'+field).val('');
                    $('#reportform-prevday_'+field).removeClass('shake-horizontal');
                    $('#reportform-prevday_'+field).parent().removeClass('has-error');
                });
            }, 400);
        } else {
            clearTimeout(addError);
            selected_checkboxes = reverse_binary.split("");
            var i = 0;
            $('.checkbox-set.prevday_'+field+'_values').find('input:not([value="000"])').each(function(e) {
                if (selected_checkboxes[i] == 1 && code_input <= max_input) {
                    $(this).prop('checked', true);
                }
                i++;
            });
        }
    }

}

var changeSelect = function(selectEl,value)  {
    if (selectEl == "reported_time") {
        setPrecTimeOptions(value);
    }
    if ($('.field-reportform-'+selectEl).hasClass('has-error') && value != '-') {
        $('.field-reportform-'+selectEl).removeClass('has-error');
        $('.help-block-'+selectEl).remove();
        $('.error-summary-msg').hide();
        $('.error-summary-msg > div > p').html('');
    }
    confirmReportClose = true;
};

$(document).on('click','.btn.change-value',function(e){
    changeElId = $(this).attr('data-element');
    direction = $(this).attr('data-direction');
    changeEl = $('#reportform-'+changeElId);
    confirmReportClose = true;
    var oldValue = parseFloat(changeEl.val());
    var dataIndex = parseInt($('#reportform-'+changeElId+'index').val());
    //console.log('index '+dataIndex);
    if (direction == 'increase') {nextIndex = dataIndex+1;} else {nextIndex = dataIndex-1;}
    //console.log('newIndex '+nextIndex);
    if (typeof fieldValues[changeElId][nextIndex] != 'undefined') {
        if (direction == 'increase') {
            newIndex = nextIndex;
        }
        if (direction == 'decrease') {
            newIndex = nextIndex;
        }
    } else {
        newIndex = dataIndex;
    }
    $('#'+changeElId+'-label').text(fieldValues[changeElId][newIndex]['label']);
    $('#reportform-'+changeElId+'index').val(newIndex).trigger('change');
    $('#reportform-'+changeElId).val(fieldValues[changeElId][newIndex]['value']);
});

$(document).on('focusin','.range-input',function(e){
    $(this).select();
    oldValue = $(this).val();
});
$(document).on('focusout','.range-input',function(e){
    confirmReportClose = true;
    decimals = $(this).data('decimals');
    separator = $(this).data('decimals_separator');
    value = $(this).val();
    elementID = $(this).data('element');
    newIndex = getKeyFromValue(fieldValues[elementID],value,decimals,separator);
    if (newIndex !== false) {
        $('#reportform-'+elementID+'index').attr('value',newIndex).trigger('change');
        $('#'+elementID+'-label').text(fieldValues[elementID][newIndex]['label']);
    } else {
        $(this).val(oldValue);
    }
});

function getRangeData(field,type,index) {
    if (typeof fieldValues[field][index] != 'undefined') {
        return fieldValues[field][index][type];
    } else {
        return false;
    }
}


$(document).on('change','#report-form select',function(e){
    var legendWrapper = $(this).attr('id').replace('reportform-','');
    var selectVal = $(this).val();
    if ($('.select-legend.'+legendWrapper).length != 0) {
        $('.select-legend.'+legendWrapper+' span').hide();
        $('span.legend.'+selectVal).show();
    }
    confirmReportClose = true;
});

$(document).on('change','#report-form input[type=radio], #report-form input[type=checkbox], #report-form input[type=text]',function(e){
    confirmReportClose = true;
});

$(document).on('change','select.check-depends.value',function(e){
    wrapperEl = $(this).closest('fieldset');
    $(wrapperEl).find('.depend-values').hide();
    $(wrapperEl).find('select.depend-values').prop('selectedIndex', 0);
    $(wrapperEl).find('select.depend-values.'+$(this).val()+' option').prop('disabled', false);
    $(wrapperEl).find('select.depend-values.'+$(this).val()+' option[data-disable-'+$(this).val()+'=\"true\"]').prop('disabled', true);
    $(wrapperEl).find('.depend-values.'+$(this).val()).slideToggle();
});

$(document).on('change','select.check-depends.element',function(e){
    wrapperEl = $(this).closest('fieldset');
    $(wrapperEl).find('.depend-element').hide();
    $(wrapperEl).find('select.depend-element').prop('selectedIndex', 0);
    if ($(this).val() != '-') {
        $(wrapperEl).find('.depend-element').slideToggle();
    }
});


$(document).on("click",".btn.toggle-button",function(e){
   toggleEl = $(this).data('element');
   toggleGroup = $(this).data('group');
   $('.btn.toggle-button').removeClass("btn-active");
   $(this).addClass("btn-active");

   if (toggleGroup == 'toggle-form-mode') {
       $('#reportform-rememberformmode').prop( "checked", false );
       if (toggleEl == 'expert') {
           $('form.form-report').addClass('expert-view');
           $('#reportform-mode').val('expert');
       } else {
           $('form.form-report').removeClass('expert-view');
           $('.expert.toggle').removeClass('show');
           $('#reportform-mode').val('standard');
       }
   } else {
       resetEl = $('.toggle-group.'+toggleGroup).not('.field-reportform-'+toggleEl);
       if ($(resetEl).data('type') == "select") {
           resetElement = $(resetEl).data('element');
           $('select#reportform-'+resetElement).prop('selectedIndex', 0);
           $('.select-legend.'+resetElement).children('.legend').slideUp();
           $(resetEl).slideUp();
       }
       if ($(resetEl).data('type') == "range") {
           resetElement = $(resetEl).data('element');
           $(resetEl).slideUp();
           $('#reportform-'+resetElement+'index').attr('value',0).trigger('change');
           $('#'+resetElement+'-label').text(fieldValues[resetElement][0]['label']);
           $('#reportform-'+resetElement+'').attr('value',fieldValues[resetElement][0]['value']);
       }
       $('.field-reportform-'+toggleEl+'.toggle-group').slideDown();
   }



});





var setPrecTimeOptions = function(datetime) {
    initDt = (datetime != 'now')?new Date(datetime):new Date;
    initDt.setSeconds(0, 0);
    startDt = ('0'+initDt.getHours()).slice(-2)+':'+('0'+initDt.getMinutes()).slice(-2);
    endDt = new Date(initDt);
    endDt.setHours( endDt.getHours() - 24 );
    h=0;
    $('#reportform-prec_timestart').children().remove().end();
    $('#reportform-prec_timestart').append('<option value="-">-</option>') ;
    
    // Quickfix Zeitumstellungs-Endlosschleife
    var lastDHours = null;
    for (var d = initDt; d >= endDt; d.setHours( d.getHours() - 1)) {

        if(lastDHours !== null) {
            if(lastDHours == d.getHours()) {
                d.setHours(d.getHours() - 2);
            }
        }
        lastDHours = d.getHours();

        if (h == 1) {
            $('#reportform-prec_timestart').append('<option value="'+d.toISOString().replace('.000Z','+00:00')+'|1">1 Stunde ('+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+' - '+startDt+')</option>') ;
        }
        if (h == 3) {
            $('#reportform-prec_timestart').append('<option value="'+d.toISOString().replace('.000Z','+00:00')+'|3">3 Stunden ('+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+' - '+startDt+')</option>') ;
        }
        if (h == 6) {
            $('#reportform-prec_timestart').append('<option value="'+d.toISOString().replace('.000Z','+00:00')+'|6">6 Stunden ('+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+' - '+startDt+')</option>') ;
        }
        if (h == 12) {
            $('#reportform-prec_timestart').append('<option value="'+d.toISOString().replace('.000Z','+00:00')+'|12">12 Stunden ('+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+' - '+startDt+')</option>') ;
        }
        if (h == 24) {
            $('#reportform-prec_timestart').append('<option value="'+d.toISOString().replace('.000Z','+00:00')+'|24">24 Stunden ('+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+' - '+startDt+')</option>') ;
        }
        h++;
    }
}

var openReport = function() {
    $('#report-msg').html(loadingGif());
    $('#report-modal').modal('show');
    $.get(get_url_path()+'/ajax/report', function(data) {
        $('#report-msg').html(data);
        if ($('#report-map').length != 0) {
            setTimeout(function(){
                $('.report-infotext').popover(
                    {
                        'trigger':'focus',
                        'html':true
                    }
                );
            }, 500);
            setPrecTimeOptions('now');
            map = L.map('report-map',{maxZoom: 14 }).setView([50.086010, 8.226490], 6);
            L.tileLayer('https://osm.kachelmannwetter.com/osm/{z}/{x}/{y}.png', {
                'attribution':  'Kartendaten &copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>',
                'useCache': true,
            }).addTo(map);
            map.on('click', function(e){
                setMarker(e.latlng);
                $('#reportform-rememberlocation').prop( "checked", false );
            });

            $.get(get_url_path()+'/ajax/reportlocation', {action:'get'}, function (data) {
                if (data !== "") {
                    var coords = data.split("|");
                    if (coords.length != 0) {
                        if (coords[0] == "STATION") {
                            // show station
                            $('#reportform-remembersource').prop( "checked", true );
                            $('#select-source').val(coords[1]);
                            $('#reportform-source').val(coords[1]);
                            $('.remember-source').show();
                            initFormMode();
                            $('.report-data').slideDown();
                        } else {
                            // show map
                            $('.map-wrapper').addClass('show');
                            setInterval(function () {
                                map.invalidateSize();
                            }, 1000);
                            markerCords = {lat:coords[0],lng:coords[1]};
                            setMarker(markerCords,14);
                            $('#reportform-rememberlocation').prop( "checked", true );
                            $('#select-source').val('location');
                            $('#reportform-source').val('location');
                            $('.location-setting-wrapper').show();
                        }



                    }
                }
            });
        }





    });

};

$('#report-modal').on("hide.bs.modal", function (e) {
    if (confirmReportClose == true) {
        if (confirm("Ihre Meldung wurde noch nicht gesendet. Möchten Sie das Formular wirkich schließen?")) {
            confirmReportClose = false;
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }

});

$(document).on('submit', '#report-form', function (e) {
    e.preventDefault();
    var form = $(this);
    $('#report-form button[type=submit]').attr('disabled',true);
    // submit form
    $.ajax({
        cache: false,
        url    : form.attr('action'),
        type   : 'post',
        data   : form.serialize(),
        dataType: 'JSON',
        success: function (response) {
            $('#report-form button[type=submit]').attr('disabled',false);
            $('.success-msg .link-text').html('');
            $('.success-msg .link-wrapper').html('');
            if (response.send == 1) {
                // Reset Form
                $.each(fieldValues, function( index, value ) {
                    if (Object.keys(value).length !== 0) {
                        $('#reportform-'+index+'index').attr('value',0).trigger('change');
                        $('#'+index+'-label').text(value[0]['label']);
                        $('#reportform-'+index+'').attr('value',value[0]['value']);
                    } else {
                        $('#reportform-'+index).prop('selectedIndex', 0);
                    }
                });
                $('.toggle.show').removeClass('show');
                $('#report-form :checkbox').prop('checked',false);
                $('#report-form :radio').prop('checked',false);
                $('#report-form .additional-field :text').val('');
                $('.depend-values').hide();
                $('.depend-element').hide();
                $('.error-summary-msg').hide();
                $('.help-block').remove();
                $('.error-summary-msg > div > p').html('');
                $('.select-legend .legend').hide();
                $('.toggle-group').hide();
                $('.buttonset .btn').removeClass('btn-active');

                confirmReportClose = false;

                // Formular ausblenden und Erfolg anzeigen
                // Wenn Links zurück gegeben werden, Buttons einfügen
                if (response.maplinks !== undefined) {
                    insertText = (Object.keys(response.maplinks).length == 1)?'Ihre Meldung ist in wenigen Minuten unter folgendem Link zu sehen. Sollten Sie allerdings einen mehrere Stunden zurückliegenden Beobachtungstermin gewählt haben, kann es unter Umständen deutlich länger dauern:':'Ihre Meldungen sind in wenigen Minuten unter folgenden Links zu sehen. Sollten Sie allerdings einen mehrere Stunden zurückliegenden Beobachtungstermin gewählt haben, kann es unter Umständen deutlich länger dauern:';
                    $('.success-msg .link-text').html('<p>'+insertText+'</p>');
                    $.each(response.maplinks, function( index, value ) {
                        aClass = (value.url != null)?'':'disabled';
                        $('.success-msg .link-wrapper').append("<p><a class='btn btn-default "+aClass+"' href='"+value.url+"'>"+value.text+"</a></p>");
                    });
                    $('.success-msg').show();
                }


                $('.form-wrapper').slideUp();
                $('.success-wrapper').slideDown();

                $('.new-report').on('click',function(e){
                    $('.form-wrapper').slideDown();
                    $('.success-wrapper').slideUp(function(){
                        $('.success-msg').hide();
                        $('.success-msg .link-wrapper').html('');
                        $('.success-msg .link-text').html('');

                    });

                });

            }  else if (response.send == -1) {
                $('.error-summary-msg').hide();
                $('.help-block').remove();
                $('.error-summary-msg > div > p').html('');
                $('.error-summary-msg > div > p').prepend('<span>Ihre Meldung konnte nicht gespeichert werden!<br /><br /><span>');
                if (typeof response.errorfields !== 'undefined') {

                    $.each(response.errorfields, function( index, value ) {

                        $('.field-reportform-'+value.errorfield).addClass('has-error');
                        $('p.help-block-'+value.errorfield).remove();
                        $('#reportform-'+value.errorfield).after('<p class=\"help-block help-block-error help-block-'+value.errorfield+'\">'+value.msg+'</p>');
                        $('.error-summary-msg > div > p').append('<span>'+value.msgglobal+'<br /><span>');
                    });

                }
                $('.error-summary-msg').slideDown();


            } else if (response.send == 0) {
                $('.error-summary-msg').hide();
                $('.help-block').remove();
                $('.error-summary-msg > div > p').html('');
                $('.error-summary-msg > div > p').prepend('<span>Ihre Meldung konnte nicht gespeichert werden, bitte versuchen Sie es in wenigen Minuten erneut!<span>');
                $('.error-summary-msg').slideDown();

            }
        },
        error : function () {
            console.log('internal server error');
            $('#report-form button[type=submit]').attr('disabled',false);
        }
    });
    return false;
});

var getImageCachePath = function() {
    var images_tld = $('#user-country-images').attr('data-value');
    if (typeof images_tld !== 'undefined' && images_tld.length === 2) {
        return url_path+'/images/'+images_tld+'/data/cache/';
    }
    return url_path+'/images/data/cache/';
};

var loadUA = function() {
        var gacode = $('#ga-code').attr('data-value');
    if (typeof gacode !== 'undefined' && gacode.length >= 12) {
        console.log('UA: Google Analytics consent check');
        var with_cookies = null;
        try {
            window.__tcfapi('getCustomVendorConsents',2,function(e) {
                if(typeof e.grants !== 'undefined'){
                    //console.log(e.grants['5e542b3a4cd8884eb41b5a72'].vendorGrant);
                    if (e.grants['5e542b3a4cd8884eb41b5a72'].vendorGrant === true) {
                        with_cookies = 'auto';
                        console.log('Full consent to Google Analytics given');
                    }
                    else if (e.grants['5e542b3a4cd8884eb41b5a72'].purposeGrants['5fbe401eedd17214b5146e55'] === true &&
                            e.grants['5e542b3a4cd8884eb41b5a72'].purposeGrants['5fbe401eedd17214b5146f4f'] === true &&
                            e.grants['5e542b3a4cd8884eb41b5a72'].purposeGrants['5fbe401eedd17214b5147088'] === true ) {
                        with_cookies = {'storage': 'none'};
                        console.log('UA: Using Google Analytics without tracking cookie, because of legal interests.');
                    }
                    else {
                        console.log('UA: No consent to legal interests given.');
                        with_cookies=false;
                    }
                    if (with_cookies) {
                        console.log('UA: Load Google Analytics.');
                        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                        ga('create', $('#ga-code').attr('data-value'), with_cookies);
                        ga('set', 'anonymizeIp', true);
                        ga('send', 'pageview');
                    }
                }
                else {
                    console.log('UA: Unknown consent status, better show no Google Analytics');
                }
            });
        }
        catch(e) {
            console.log('UA: Error while trying to get consent status, better show no Google Analytics');
        };
    }
    else {
         console.log('UA: No Google Analytics code found, so skipping using GA.');
    }
};

function getCookie(name) {
    if (!document.cookie) return null;
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; Expires=" + expires + "; Path=/; SameSite=Lax";
}

function getDarkmodeButtons() {
    return Array.from(document.querySelectorAll('.darkmode-toggle'));
}
function updateToggleButtonUI(isDark) {
    const title = isDark ? 'Helles Design aktivieren' : 'Darkmode aktivieren';
    getDarkmodeButtons().forEach(btn => {
        btn.setAttribute('title', title);
        btn.setAttribute('aria-pressed', String(isDark));
        const icon = btn.querySelector('.btn-icon');
        if (icon) {
            icon.classList.toggle('icon-darkmode', !isDark);
            icon.classList.toggle('icon-brightmode', isDark);
        }
    });
}


function applyMode(mode) {
    if ($('.kw-wrapper').length != 0) {
        const isDark = mode === 'dark';
        setCookie('kw_theme', mode)
        document.body.classList.toggle('dark', isDark);
        updateToggleButtonUI(isDark);
        if (window.Highcharts && Array.isArray(Highcharts.charts) && Highcharts.charts.some(c => !!c)) {
            window.location.reload();
        }
    }

}


function detectInitialMode() {
    const cookie = getCookie('kw_theme'); // 'dark' | 'bright' | null
    if (cookie === 'dark' || cookie === 'bright') return cookie;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'bright';
}


function toggleDarkmode() {
    const nowDark = document.body.classList.contains('dark');
    const nextMode = nowDark ? 'bright' : 'dark';
    applyMode(nextMode);
    setCookie('kw_theme', nextMode);
}


(function initDarkmode() {
    const initial = detectInitialMode();
    applyMode(initial);

    if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        if (mq.addEventListener) {
            mq.addEventListener('change', e => {
                if (!getCookie('kw_theme')) applyMode(e.matches ? 'dark' : 'bright');
            });
        } else if (mq.addListener) {
            // ältere Browser
            mq.addListener(e => {
                if (!getCookie('kw_theme')) applyMode(e.matches ? 'dark' : 'bright');
            });
        }
    }
})();

var showGAConsent = function() {
    const hideGAConsent = getCookie("hideGAConsent");
    window.__tcfapi('getCustomVendorConsents',2,function(e) {
        if (typeof e.grants !== 'undefined') {
            if (
                e.grants['5e542b3a4cd8884eb41b5a72'].vendorGrant != true
                && e.grants['5e952f6107d9d20c88e7c975'].vendorGrant != true
                && hideGAConsent !== "true"
            ) {
                $('.ga-consent').show();
            }
        }
    });
}
$(document).on('click','.ga-consent .buttons .grant',function(e){
    let date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    document.cookie = "hideGAConsent=true; path=/; expires=" + date.toUTCString() + ";";
    document.cookie = "customerGAConsent=true; path=/; expires=" + date.toUTCString() + ";";
    $('.ga-consent').remove();
});

$(document).on('click','.ga-consent .buttons .deny',function(e){
    let date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    document.cookie = "hideGAConsent=true; path=/; expires=" + date.toUTCString() + ";";
    document.cookie = "customerGAConsent=false; path=/; expires=" + date.toUTCString() + ";";
    $('.ga-consent').remove();
});


function loadGTM(w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});

    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';

    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
}

var loadGA4 = function() {
    let gacode_global = $('#ga4-code-global').attr('data-value');
    let gacode_portal = $('#ga4-code-portal').attr('data-value');

    const customerGAConsent = getCookie("customerGAConsent");

    if (typeof gacode_global !== 'undefined' && gacode_global.length >= 12) {
        console.log('GA4: Google Analytics consent check');

        try {
            window.__tcfapi('getCustomVendorConsents', 2, function(e) {
                if (typeof e.grants !== 'undefined') {
                    if ((e.grants['5e542b3a4cd8884eb41b5a72'].vendorGrant === true &&
                            e.grants['5e952f6107d9d20c88e7c975'].vendorGrant === true)
                        && (customerGAConsent === null ||
                            (customerGAConsent != null && customerGAConsent == 'true'))
                        || (customerGAConsent != null && customerGAConsent == 'true')) {

                        console.log('GA4: Full consent to Google Analytics given');
                        console.log('GA4: Load Google Analytics.');
                        let date = new Date();
                        date.setFullYear(date.getFullYear() + 2);
                        document.cookie = "hideGAConsent=true; path=/; expires=" + date.toUTCString() + ";";
                        document.cookie = "customerGAConsent=true; path=/; expires=" + date.toUTCString() + ";";

                        (function() {
                            // Lade beide Tag Manager
                            loadGTM(window, document, 'script', 'dataLayer', gacode_global);
                            loadGTM(window, document, 'script', 'dataLayer', gacode_portal);

                            // Definiere die globale gtag-Funktion
                            window.gtag = function() {
                                dataLayer.push(arguments);
                            };

                            // Konfiguriere beide GA4-Properties
                            gtag('config', gacode_global);
                            gtag('config', gacode_portal);

                            gtag('consent', 'default', {
                                'ad_storage': 'granted',
                                'analytics_storage': 'granted',
                                'ad_user_data': 'granted',
                                'ad_personalization': 'granted',
                                'functionality_storage': 'granted',
                                'personalization_storage': 'granted',
                                'security_storage': 'granted'
                            });
                            gtmPathParser(false);
                            console.log('GA4: Loaded.');
                        })();
                    } else {
                        console.log('GA4: No consent to legal interests given.');
                    }
                } else {
                    console.log('GA4: Unknown consent status, better show no Google Analytics');
                }
            });
        } catch(e) {
            console.log('GA4: Error while trying to get consent status, better show no Google Analytics');
        }
    } else {
        console.log('GA4: No Google Analytics code found, so skipping using GA.');
    }
};

var loadGoAn = function() {
    loadUA();
    loadGA4();
};

var preventCounter = 0;
var pushToDataLayer = function(data) {
    if (typeof window.dataLayer === 'undefined') {
        if (preventDataLayerPush.value > 0) {
            if (preventDataLayerPushRepeat >= 1) {
                preventCounter = preventCounter+1;
            }
            if (preventCounter >= preventDataLayerPushRepeat) {
                preventDataLayerPush.value = 0;
                preventCounter = 0;
                preventDataLayerPushRepeat = 1;
            }
        }
        return false;
    }
    if (preventDataLayerPush.value === 0) {
        if (Array.isArray(data)) {
            data.forEach(function(item) {
                console.log(item);
                dataLayer.push(item);
            });
            return;
        }
        console.log(data);
        dataLayer.push(data);
        return;
    } else {
        if (preventDataLayerPushRepeat >= 1) {
            preventCounter = preventCounter+1;
        }
        if (preventCounter >= preventDataLayerPushRepeat) {
            preventDataLayerPush.value = 0;
            preventCounter = 0;
            preventDataLayerPushRepeat = 1;
        }
        return;
    }
    return false;
}

const gtmCategoryMapping = {
    toplevel: {
        'vorhersage': 'vorhersage',
        'forecast': 'vorhersage',
        'wetter': 'vorhersage',
        'weather': 'vorhersage',
        'modellkarten': 'modellkarten',
        'model-charts': 'modellkarten',
        '46tage-wettervorhersage':'modellkarten',
        '46days-weather-forecast':'modellkarten',
        'monatsvorhersage':'modellkarten',
        'monthly-charts':'modellkarten',
        'wave-height-forecast':'modellkarten',
        'wellenhoehen-prognosen':'modellkarten',
        'wirbelsturm-tracks':'modellkarten',
        'cyclone-tracks':'modellkarten',
        'aurora':'modellkarten',
        'analyse': 'analyse',
        'messwerte': 'messwerte',
        'kw-messnetz': 'messwerte',
        'kw-network': 'messwerte',
        'amateurstationen': 'messwerte',
        'amateur-stations': 'messwerte',
        'weather-reporter': 'messwerte',
        'wettermelder': 'messwerte',
        'autobahn': 'messwerte',
        'highway': 'messwerte',
        'radiosonden-werte': 'messwerte',
        'radiosonde-values': 'messwerte',
        'observations': 'messwerte',
        'luftqualitaet':'messwerte',
        'drei-wetter-messnetz':'messwerte',
        'drei-weather-network':'messwerte',
        'pollen':'messwerte',
        'luftqualitaet-prognose':'umwelt',
        'wetteranalyse':'radar',
        'regenradar': 'radar',
        'einzelradar': 'radar',
        'singleradar': 'radar',
        'radarsweeps': 'radar',
        'dopplersweeps': 'radar',
        'radar-seitenaufriss': 'radar',
        'radar-vcs': 'radar',
        'radar-us': 'radar',
        'radar-standard': 'radar',
        'radarprognose': 'radar',
        'radarfc': 'radar',
        'gewitter': 'radar',
        'radar-hd': 'radar',
        '3d-radar-analyse': 'radar',
        '3d-radar-analysis': 'radar',
        'hagel':'radar',
        'hail':'radar',
        'blitze':'radar',
        'erdblitze':'radar',
        'lightning-cg':'radar',
        'blitzanalyse':'radar',
        'lightning':'radar',
        'stormradar':'radar',
        'lightning-cg':'radar',
        'erdblitze':'radar',
        'stormtracking':'radar',
        'flashflood':'radar',
        'regensummen':'radar',
        'precipitation':'radar',
        'sat':'satellitenbilder',
        'satellite':'satellitenbilder',
        'klimavergleich':'klima',
        'reanalyse':'klima',
        'reanalysis':'klima',
        'info':'info',
    },
    patterns: {
        'vorhersage': {
            getSubLevel: function(path) {
                switch(true) {
                    case path.includes('/wetter'):
                    case path.includes('/weather'):
                        return 'wetterübersicht';
                    case path.includes('/kompakt1x1'):
                    case path.includes('/kompakt'):
                    case path.includes('/meteogram'):
                        return 'kompakt';
                    case path.includes('/ensemble'):
                        return 'ensemble';
                    case path.includes('/14-day-trend'):
                    case path.includes('/14-tage-trend'):
                        return '14-tage-trend';
                    case path.includes('/xl'):
                        return 'xl';
                    case path.includes('/xltrend'):
                        return 'xltrend';
                    default:
                        return '';
                }

            }
        },
        'modellkarten': {
            getSubLevel: function(path) {
                switch(true) {
                    case path.includes('/46tage-wettervorhersage'):
                    case path.includes('/46days-weather-forecast'):
                        return '46tage-wettervorhersage';
                    case path.includes('/monatsvorhersage'):
                    case path.includes('/monthly-charts'):
                        return '7-monats-vorhersage';
                    case path.includes('/wellenhoehen-prognosen'):
                    case path.includes('/wave-height-forecast'):
                        return 'wellenhoehen-prognosen';
                    case path.includes('/wirbelsturm-tracks'):
                    case path.includes('/cyclone-tracks'):
                        return 'wirbelsturm-tracks';
                    case path.includes('/aurora'):
                        return {toplevel:'umwelt',sublevel:'aurora'};
                    case path.includes('/photovoltaik-solar-potenzial'):
                    case path.includes('/solar-pv-power-potential'):
                        return {toplevel:'umwelt',sublevel:'photovoltaik-solar-potenzial'};
                    case path.includes('/windkraft-potenzial-onshore'):
                    case path.includes('/wind-power-potential-onshore'):
                        return {toplevel:'umwelt',sublevel:'windkraft-potenzial-onshore'};
                    case path.includes('/windkraft-potenzial-offshore'):
                    case path.includes('/wind-power-potential-offshore'):
                        return {toplevel:'umwelt',sublevel:'windkraft-potenzial-offshore'};
                    case path.includes('/heiz-gradtage-vdi'):
                    case path.includes('/heating-degree-day-vdi'):
                        return {toplevel:'umwelt',sublevel:'heiz-gradtage-vdi'};
                    case path.includes('/heiz-gradtage-kmw'):
                    case path.includes('/heating-degree-day-kmw'):
                        return {toplevel:'umwelt',sublevel:'heiz-gradtage-kmw'};
                    default:
                        return path.split('/')[3];
                }
            }
        },
        'umwelt': {
            getSubLevel: function(path) {
                switch(true) {
                    case path.includes('/cams-ecmwf'):
                        return 'luftqualitaet prognose cams-ecmwf';
                    case path.includes('/geos-nasa'):
                        return 'luftqualitaet prognose geos-nasa';
                    default:
                        return '';
                }
            }
        },
        'analyse': {
            getSubLevel: function(path) {
                if (path.match(/\/analyse\/([^/]+)\.html$/)) {
                    return path.match(/\/analyse\/([^/]+)\.html$/)[1];
                }
                if (path.match(/\/analyse\/.*?\/.*?\/([^/]+)\/.*\.html$/)) {
                    return path.match(/\/analyse\/.*?\/.*?\/([^/]+)\/.*\.html$/)[1];
                }
                return '';
            }
        },
        'messwerte': {
            getSubLevel: function(path) {
                switch (true) {
                    case path.includes('/messwerte'):
                    case path.includes('/observations'):
                        return 'hauptnetz';
                    case path.includes('/kw-messnetz'):
                    case path.includes('/kw-network'):
                        return 'kw-messnetz';
                    case path.includes('/amateurstationen'):
                    case path.includes('/amateur-stations'):
                        return 'amateurstationen';
                    case path.includes('/wettermelder'):
                    case path.includes('/weather-reporter'):
                        return 'wettermelder';
                    case path.includes('/radiosonden-werte'):
                    case path.includes('/radiosonde-values'):
                        return 'radiosonden';
                    case path.includes('/highway'):
                    case path.includes('/autobahn'):
                        return 'autobahn';
                    case path.includes('/luftqualitaet'):
                    case path.includes('/air-quality'):
                        return 'luftqualitaet';
                    case path.includes('/drei-wetter-messnetz'):
                    case path.includes('/drei-weather-network'):
                        return 'drei-wetter-messnetz';
                    case path.includes('/pollen'):
                        return 'pollen';
                    default:
                        return '';
                }
            }
        },
        'radar': {
            getSubLevel: function(path) {
                switch(true) {
                    case path.includes('/wetteranalyse'):
                        return 'wetteranalyse';
                    case path.includes('/regenradar'):
                    case path.includes('/einzelradar'):
                    case path.includes('/singleradar'):
                    case path.includes('/radar-hd'):
                        if (path.includes('vsweep')) {
                            return 'doppler';
                        } else if (path.includes('schaumberg')) {
                            return 'schaumberg';
                        } else if (path.includes('giessen')) {
                            return 'giessen';
                        } else if (path.includes('/einzelradar')) {
                            return 'einzelradar';
                        } else if (path.includes('eu-opera')) {
                            return 'operacomposite';
                        } else if (path.includes('srcit-radar')) {
                            return 'italycomposite'
                        } else if (path.includes('/europa') || path.includes('/europe')) {
                            return 'europacomposite';
                        }   else {
                            return 'radar-hd';
                        }
                    case path.includes('/radar-standard'):
                        return 'radar-sd';
                    case path.includes('/flashflood'):
                        return 'flashflood';
                    case path.includes('/radarprognose'):
                    case path.includes('/radarfc'):
                        return 'radarprognose';
                    case path.includes('/gewitter'):
                    case path.includes('/stormradar'):
                        return 'gewitter';
                    case path.includes('/blitze'):
                    case path.includes('/blitzanalyse'):
                    case path.includes('/lightning'):
                        return 'blitze';
                    case path.includes('/erdblitze'):
                    case path.includes('/lightning-cg'):
                        return 'weltblitze';
                    case path.includes('/hagel'):
                    case path.includes('/hail'):
                        return 'hagel';
                    case path.includes('/stormtracking'):
                        return 'stormtracking';
                    case path.includes('/regensummen'):
                    case path.includes('/precipitation'):
                        return 'regensummen';
                    case path.includes('/3d-radar-analyse'):
                    case path.includes('/3d-radar-analysis'):
                        return '3d-radar-analyse';
                    case path.includes('/radarsweeps'):
                        return 'radarsweeps';
                    case path.includes('/dopplersweeps'):
                        return 'dopplersweeps';
                    case path.includes('/radar-seitenaufriss'):
                    case path.includes('/radar-vcs'):
                        return 'radar-seitenaufriss';
                    case path.includes('/radar-us'):
                        return 'radar-us';
                    default:
                        return '';
                }
            }
        },
        'satellitenbilder': {
            getSubLevel: function(path) {
                if (path.match(/(sat|satellite)\/([^/]+)\.html$/)) {
                    return path.match(/(sat|satellite)\/([^/]+)\.html$/)[2];
                }
                if (path.match(/\/(sat|satellite)\/[^/]+\/([^/]+)\/[^/]+\.html$/)) {
                    return path.match(/\/(sat|satellite)\/[^/]+\/([^/]+)\/[^/]+\.html$/)[2];
                }
                return '';
            }
        },
        'klima': {
            getSubLevel: function (path) {
                switch (true) {
                    case path.includes('/klimavergleich'):
                        return 'klimavergleich';
                    case path.includes('/ecmwf-era5') :
                        return 'era5';
                    case path.includes('/cosmo-rea6'):
                        return 'rea6';
                    case path.includes('/conus-rea'):
                        return 'conus ncar';
                    default:
                        return '';
                }
            }
        },
        'info': {
            getSubLevel: function (path) {
                switch (true) {
                    case path.includes('/astrowetter'):
                        return {toplevel:'umwelt',sublevel:'astrowetter'};
                    case path.includes('/pollenflug'):
                        return {toplevel:'umwelt',sublevel:'pollenflug'};
                    case /\/[^/]+\/info\/([^/]+)$/.test(path):
                        const match = path.match(/\/[^/]+\/info\/([^/]+)$/);
                        return match ? match[1] : '';
                    default:
                        return '';
                }
            }
        }
    }
};

window.watchPathChange = function(callbackFn) {

    if (typeof window.watchPathChange.activeWatchers === 'undefined') {
        window.watchPathChange.activeWatchers = new Set();
    }

    const watcherId = Date.now();
    window.watchPathChange.activeWatchers.add(watcherId);

    const originalPath = window.location.pathname;
    const originalPathData = gtmPathParser(originalPath, true);
    const handleChange = (newPath) => {
        if (!window.watchPathChange.activeWatchers.has(watcherId)) {
            cleanup();
            return;
        }

        const newPathData = gtmPathParser(newPath, true);
        if (newPathData.sublevel !== originalPathData.sublevel) {
            // Alle aktiven Watcher entfernen
            window.watchPathChange.activeWatchers.clear();
            cleanup();
            callbackFn(newPath);
        }
    };

    const cleanup = () => {
        window.removeEventListener('popstate', popstateHandler);
        observer.disconnect();
    };

    const popstateHandler = () => {
        handleChange(window.location.pathname);
    };
    window.addEventListener('popstate', popstateHandler);

    const observer = new MutationObserver(() => {
        const currentPath = window.location.pathname;
        handleChange(currentPath);
    });

    observer.observe(document.body, {
        subtree: true,
        childList: true
    });
}

function gtmPathParser(usepath,returndata) {
    let path ='';
    if (usepath === false) {
        path = window.location.pathname;
    } else {
        path = usepath;
    }

    if (Object.keys(gtmCategoryMapping.toplevel).some(key => path.includes(key))) {
        const pathParts = path.split('/').filter(part => part);
        let toplevel = '';
        for (const [key, value] of Object.entries(gtmCategoryMapping.toplevel)) {
            if (pathParts.includes(key)) {
                toplevel = value;
                const pattern = gtmCategoryMapping.patterns[value];
                const result = pattern ? pattern.getSubLevel(path) : null;
                const finalValues = typeof result === 'object' && result !== null ? result : {toplevel: value, sublevel: result};
                if (returndata === true) {
                    return finalValues;
                } else {
                    pushToDataLayer({event:'pageview',...finalValues});
                }

            }
        }
    }
    return false;
}
var gotoLogin = function() {
    var loc = document.location.href;
    var sourcep = 'sourcepoint=login';
    if (loc.indexOf('?') === -1) {
        document.location.href = loc+'?'+sourcep;
    }
    else {
        document.location.href = loc+'&'+sourcep;
    }
}
var gotoImpressum = function() {
    var loc = document.location.href;
    var sourcep = 'sourcepoint=impressum';
    if (loc.indexOf('?') === -1) {
        document.location.href = loc+'?'+sourcep;
    }
    else {
        document.location.href = loc+'&'+sourcep;
    }
}
var gotoAngebote = function() {
    var loc = document.location.href;
    var sourcep = 'sourcepoint=angebote';
    if (loc.indexOf('?') === -1) {
        document.location.href = loc+'?'+sourcep;
    }
    else {
        document.location.href = loc+'&'+sourcep;
    }
};
var gotoOffers = function() {
    var loc = document.location.href;
    var sourcep = 'sourcepoint=offers';
    if (loc.indexOf('?') === -1) {
        document.location.href = loc+'?'+sourcep;
    }
    else {
        document.location.href = loc+'&'+sourcep;
    }
};
var gotoRegister = function() {
    var loc = document.location.href;
    var sourcep = 'sourcepoint=register';
    if (loc.indexOf('?') === -1) {
        document.location.href = loc+'?'+sourcep;
    }
    else {
        document.location.href = loc+'&'+sourcep;
    }
};
var gotoDatenschutz = function() {
    var loc = document.location.href;
    var sourcep = 'sourcepoint=datenschutz';
    if (loc.indexOf('?') === -1) {
        document.location.href = loc+'?'+sourcep;
    }
    else {
        document.location.href = loc+'&'+sourcep;
    }
};
var loadDefE = function() {
    var content = $('#def-e2456').attr('data-info');
    if (typeof content !== 'undefined' && content.length === 20) {
        try {
            window.__tcfapi('getCustomVendorConsents',2,function(e) {
                if(typeof e.grants !== 'undefined'){
                    //console.log(e.grants['5e542b3a4cd8884eb41b5a72'].vendorGrant);
                    if (e.grants['5e542b3a4cd8884eb41b5a72'].vendorGrant === true || (e.grants['5e542b3a4cd8884eb41b5a72'].purposeGrants['5fbe401eedd17214b5146e55'] === true &&
                            e.grants['5e542b3a4cd8884eb41b5a72'].purposeGrants['5fbe401eedd17214b5146f4f'] === true &&
                            e.grants['5e542b3a4cd8884eb41b5a72'].purposeGrants['5fbe401eedd17214b5147088'] === true )) {
                            eval(content+'()');
                    }
                    else {
                        console.log('Could not load DefE2456 (1)');
                    }
                }
                else {
                    console.log('Could not load DefE2456 (2)');
                }
            });
        }
        catch(e) {
            console.log('Could not load DefE2456');
        };
    }
    else {
        console.log('No Def definition');
    }
};
var loadMT = function(mtsc) {
    try {
        window.__tcfapi('getCustomVendorConsents',2,function(e) {
            if(typeof e.grants !== 'undefined'){
                //console.log(e.grants['5e542b3a4cd8884eb41b5a72'].vendorGrant);
                if (e.grants['5e542b3a4cd8884eb41b5a72'].vendorGrant === true || (e.grants['5e542b3a4cd8884eb41b5a72'].purposeGrants['5fbe401eedd17214b5146e55'] === true &&
                        e.grants['5e542b3a4cd8884eb41b5a72'].purposeGrants['5fbe401eedd17214b5146f4f'] === true &&
                        e.grants['5e542b3a4cd8884eb41b5a72'].purposeGrants['5fbe401eedd17214b5147088'] === true )) {
                        $.getScript(mtsc, function() {
                            regSl(SDG);
                        });
                }
                else {
                    console.log('Could not load MetaTag.js (1)');
                }
            }
            else {
                console.log('Could not load MetaTag.js (2)');
            }
        });
    }
    catch(e) {
        console.log('Could not load MetaTag.js');
    };
};

var loadTaboola = function(showT) {
    try {
        window.__tcfapi('addEventListener',2,function(tcData, success) {
            if (tcData.vendor.consents[42] === true) {
                window._taboola = window._taboola || [];
                _taboola.push(showT);
                !function (tcData, f, u, i) {
                  if (!document.getElementById(i)){
                      tcData.async = 1;
                      tcData.src = u;
                      tcData.id = i;
                    f.parentNode.insertBefore(tcData, f);
                  }
                }(document.createElement('script'),
                document.getElementsByTagName('script')[0],
                '//cdn.taboola.com/libtrc/stroeer-kachelmannwetter/loader.js',
                'tb_loader_script');
                if(window.performance && typeof window.performance.mark == 'function')
                  {window.performance.mark('tbl_ic');}
                console.log('Taboola loaded');
            }
        });
    }
    catch (e) {
        console.log('Could not load Taboola');
    }
};

var tcCallback = function (tcData, success) {
    if(success && tcData.eventStatus === 'useractioncomplete') {
        lAfCo();
    }
    else {
        setTimeout(tcCallback, 1000);
    }
};
var checkTcUI = function() {
    window.__tcfapi('addEventListener', 2,
        function(tcData, success) {
            if(tcData.eventStatus !== 'cmpuishown') {
                lAfCo();
            };
        });
};
var isTcLoaded = function (tcData, success) {
    if(success && tcData.eventStatus === 'tcloaded') {
        setTimeout( function() { checkTcUI();}, 1500);
    } else {
        setTimeout(isTcLoaded, 300);
    };
};
var checkTCF = function() {
    if (typeof window.__tcfapi === 'function' && typeof loadGoAn === 'function' && typeof loadTaboola === 'function') {
        window.__tcfapi('addEventListener', 2, isTcLoaded);
        window.__tcfapi('addEventListener', 2, tcCallback);
    }
    else {
        setTimeout(checkTCF, 300); }
}; checkTCF();

var getLinkElement = function(id) {
    var link = $('#text-overlay a[data-station-id="'+id+'"]');
    if (link.length === 0) {
        // german ids have been renamed from "\d+" to "D-\d{5}, so we'll check the fallback
        link = $('#text-overlay a[data-station-id="'+ ("D-" + id.padStart(5, '0')) +'"]');
    }
    return link;
}
