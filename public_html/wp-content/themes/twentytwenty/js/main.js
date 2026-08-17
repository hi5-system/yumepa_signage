	var page;
	var page_cnt;
	var resizeTimer = null;
	$(function() {
		page=0;
		page_cnt=0;
		disp_page = 0;

		$('#slide').load('index.php?mode=slider&sotoyu_name='+sotoyu_name+'&facility_cd='+facility_cd,function(){
			// $('#buffer').load('index.php?mode=news',function(){
			// 	if($('#buffer').html()!=''){
			// 		$('#slide').append($('#buffer').html());
			// 	}
			// 	slide_cnt = parseInt($('#slide').children('div').length-1);
				$('#slide').children('div').hide();
				Start_Slider();
			// 	Telop_Timer();
			// });
		});

		$(window).on('load mousemove', function() {
			clearTimeout(resizeTimer);
			$('body').removeClass('cursor-hide');
			resizeTimer = setTimeout(function() {
				$('body').addClass('cursor-hide');
			}, 3000);
		});

		$('#close-btn').on('click', function(){
			window.open('about:blank','_self').close();
		});

		$(document).on('click',function(e){
			var x = e.pageX;
			var w = $(window).width();
			if(x*2 <= w){
				console.log('←');
				page --;
				if(page < 0){
					//page = slide_cnt;
					page = parseInt($('#slide').children('div').length-1);
				}
			}else{
				console.log('→');
				page ++;
				//if(page > slide_cnt){
				if(page > parseInt($('#slide').children('div').length-1)){
					page = 0;
				}
			}
			$('#slide').children('div').stop();
			$('#progress_bar').stop();
			ChangeSlider(page);
		});
	});

	function ChangeSlider(page){
		var Scroll_h = 0;
		var Interval;
		var hide_no = page - 1;
		var id = $('#slide').children('div').eq(page).attr('id');
		console.log('id '+id);

		if(hide_no < 0){
			//hide_no = slide_cnt;
			hide_no = parseInt($('#slide').children('div').length-1);
		}

		$('#slide').children('div').eq(hide_no).fadeOut(1000, function() {
			// if(id != 'img1'){
				$('#slide').children('div').hide();
			// }
			$('#progress_bar').width(0);

			// if(id == 'img1'){
			// 	//最初の画像を表示する際に、イベント情報をリロードする
			// 	$('#slide').children('#news').remove();
			// 	$('#buffer').load('index.php?mode=news',function(){
			// 		console.log('イベント読み込み');
			// 		if($('#buffer').html()!=''){
			// 			console.log('イベント有り');
			// 			$('#slide').append($('#buffer').html());
			// 		}
			// 		//slide_cnt = parseInt($('#slide').children('div').length-1);
			// 		$('#buffer').html('');
			// 	});
			// }

			// if(id == 'news'){
			// 	//イベントを表示する場合はスクロールが必要なコンテンツ高さか検証する
			// 	Scroll_h = $('#slide').children('div').eq(page).innerHeight() - $(window).height();
			//
			// 	$('#slide').children('.img').remove();
			// 	$('#buffer').load('index.php?mode=all_slider',function(){
			// 		console.log('スライダー画像読み込み');
			// 		if($('#buffer').html()!=''){
			// 			console.log('イベント有り');
			// 			$('#slide').prepend($('#buffer').html());
			// 		}
			// 		//slide_cnt = parseInt($('#slide').children('div').length-1);
			// 		$('#buffer').html('');
			// 	});
			// }

			$('#'+id).css({'top':'0px'});
			$('#'+id).fadeIn(1000, function() {
				if(Scroll_h <= 0){
					Interval = $('#'+id).data('interval');
					console.log('　　スクロール無し');
					$('#progress_bar').animate({'width': '100%' }, Interval, 'linear', function() {
						console.log('page='+page);
						console.log('page_cnt='+page_cnt);
						Start_Slider();
					});
				}else{
					Interval = 15000 + (Scroll_h * 18);
					console.log('　　スクロール開始');
					$('#'+id).delay(3000).animate({'top':'-'+Scroll_h+'px'},Interval,function(){
						console.log('　　スクロール終了');
						Start_Slider();
					});
				}

			});
		});
	};

	function Start_Slider(){
		ChangeSlider(page);
		page ++;
		page_cnt ++;
		if(page > parseInt($('#slide').children('div').length-1)){
			page = 0;
		}
		if(page_cnt >= 30 && page == 0){
		// if(page_cnt >= 3){
			setTimeout(function() {
				location.reload();
			}, 5000);
			// location.reload();
		}
	}

	// function Telop_Timer(){
	// 	telop();
	// }
	//
	// function telop(){
	// 	var msg;
	// 	var w = $(window).width();
	// 	$('#msg').load('index.php?mode=signage_telop',function(){
	// 		msg = $('#msg').html();
	// 		if(msg != ''){
	// 			var msg_w = $('#msg').width();
	// 			var interval = (msg_w + w) * 10;
	// 			$('body').addClass('disp_msg');
	// 			$('#msg').css({left: w+'px'});
	// 			$('#msg').animate({left:'-'+msg_w+'px'}, interval, 'linear', function() {
	// 				Telop_Timer();
	// 			});
	// 		}else{
	// 			$('body').removeClass('disp_msg');
	// 			setInterval(function(){
	// 				Telop_Timer();
	// 			},60000);
	// 		}
	// 	});
	// }
