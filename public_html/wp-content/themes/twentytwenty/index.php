<?php
// require_once($_SERVER["DOCUMENT_ROOT"].'/wp-load.php');
?>


<?php
/*
if($_GET['mode'] == 'slider'){
?>
<div id="img1" class="img bg-img" data-interval="100">円グラフ</div>
<div id="img2" class="img bg-img" data-interval="100">共通1</div>
<div id="img3" class="img bg-img" data-interval="100">共通2</div>
<div id="img4" class="img bg-img" data-interval="100">個別1</div>
<div id="img5" class="img bg-img" data-interval="100">個別2</div>
<div id="img6" class="img bg-img" data-interval="100">次回休湯日</div>

<div id="img7" class="img bg-img" data-interval="100">2円グラフ</div>
<div id="img8" class="img bg-img" data-interval="100">2共通1</div>
<div id="img9" class="img bg-img" data-interval="100">2共通2</div>
<div id="img10" class="img bg-img" data-interval="100">2個別1</div>
<div id="img11" class="img bg-img" data-interval="100">2個別2</div>
<div id="img12" class="img bg-img" data-interval="100">2次回休湯日</div>
<?php
exit;
}
*/
 ?>

<?php

//各外湯対応配列------------------------------------------------------------------------------------------------------------
$facility_pair = array(
	//'108' => 'satonoyu',
	'111' => 'zizouyu',
	'114' => 'yanagiyu',
	'112' => 'ichinoyu',
	'121' => 'gosyonoyu',
	'124' => 'mandarayu',
	'126' => 'kounoyu',
);

$facility_cd = $_GET['facility_cd'];
$sotoyu_name = $facility_pair[$facility_cd];
?>
<script>
	<?php #main.jsに渡す値を定義 ?>
	var facility_cd = '<?=$facility_cd?>';
	var sotoyu_name = '<?=$sotoyu_name?>';
</script>
<?php

if($_GET['mode'] == 'slider'){
	#施設別 GoogleカレンダーIDのリスト
	$facility_calendar_id = array(
		//'108' => 'nmpfqg8t759p175hh3q1jt2bnk@group.calendar.google.com',	#さとの湯（男）
		'111' => 'co7emv2ruo04ughgu6495l9phg@group.calendar.google.com',	#地蔵湯（男）
		'114' => 'ekbkknekkhp379od6drvterhec@group.calendar.google.com',	#柳湯（男）
		'112' => '62omaa32la1q6lbcict00q3rmc@group.calendar.google.com',	#一の湯（男）
		'121' => 'tk6qjo7hnbs9vucinl8uhm2rgo@group.calendar.google.com',	#御所の湯（男）
		'124' => 'bhp0s48nvjpcdnh8u8rhpdcfp0@group.calendar.google.com',	#まんだら湯（男）
		'126' => '1beumqsir7d7vnmepatqe37mp8@group.calendar.google.com',	#鴻の湯（男）
	);

	$facility_cd = $_GET['facility_cd'];

	require_once '/home/signage/lib/google-api-php-client/vendor/autoload.php';
	$json_path = '/home/signage/lib/google-api-php-client/key/calendar-6a0da3821908.json';

	$scopes = array(Google_Service_Calendar::CALENDAR);

	$client = new Google_Client();

	$client->setApplicationName("Google Calendar PHP API");
	$client->setScopes($scopes);

	$client->setAuthConfig($json_path);

	if ($client->isAccessTokenExpired()) {
		#$client->refreshTokenWithAssertion();
	}

	$service = new Google_Service_Calendar($client);

	//当日と翌日の営業情報取得するための時間設定
	$t = mktime(0, 0, 0, date('n'), date('j'), date('Y'));
	$t2 = mktime(23, 59, 59, date('n',strtotime("+180 day")), date('j',strtotime("+180 day")), date('Y',strtotime("+180 day")));

	$status = '';
	$status_ary = array();
	$calendarId = $facility_calendar_id[$facility_cd];
	$optParams = array(
		'maxResults' => 180,
		'orderBy' => 'startTime',
		'singleEvents' => TRUE,
		'timeMin' => date('c', $t),
		'timeMax' => date('c', $t2),
	);

	$results = $service->events->listEvents($calendarId, $optParams);

	$date_ary  = array();
	$holiday   = array();
	for ($j = 0 ; $j < count($results['items']); $j++) {
		$date_ary[] = substr($results['items'][$j]['start']['dateTime'],0,10);
	}

	for($date_cnt=0;$date_cnt<count($date_ary);$date_cnt++) {
		$startDate = $date_ary[$date_cnt];
		$endDate = $date_ary[$date_cnt+1];
		$diff = (strtotime($endDate) - strtotime($startDate)) / ( 60 * 60 * 24);
		if($diff > 1) {
		// var_dump($diff);exit;
			for($i = 1; $i < $diff; $i++) {
				$holiday[] = date('Y-m-d', strtotime($startDate . '+' . $i . 'days'));
			}
		}
	}

	$youbi = date('w', strtotime($holiday[0]));
	$next_holiday = date('Y年n月j日',strtotime($holiday[0]));
	$week  = ['日','月','火','水','木','金','土'];
	$next_holiday .= '('.$week[$youbi].')';
	$year = mb_substr($next_holiday,0,5);
	$date = mb_substr($next_holiday,5);

	//御所の湯改装中のため、一時的な表示(改装工事完了後、この3行は消す)
	if($facility_cd == '121') {
		//御所の湯の場合
		$next_holiday = '長期休館';
	}

	//混雑状況円グラフ取得------------------------------------------------------------------------------------------------------

	//$facility = ['108', '111', '114', '112', '121', '124', '126'];
	//$facility_name = ['さとの湯', '地蔵湯', '柳湯', '一の湯', '御所の湯', 'まんだら湯', '鴻の湯'];
	$facility = ['111', '114', '112', '121', '124', '126'];
	$facility_name = ['地蔵湯', '柳湯', '一の湯', '御所の湯', 'まんだら湯', '鴻の湯'];

	$handle = fopen("https://signage.kinosaki-onsen.net/external_data/sotoyu.csv", "r");
	$con = file_get_contents("https://signage.kinosaki-onsen.net/external_data/sotoyu.html", "r");

	$con = strstr($con, '<div id="content">');
	$con = strstr($con, '<script>', true);

	// ゆめぱ側の更新日時を取得
	$last_update = date('Y/m/d (D) H:i');
	if (preg_match('/<span[^>]*id="last-update"[^>]*>(.*?)<\/span>/s', $con, $matches)) {
		$last_update = trim(strip_tags($matches[1]));
	}

	// 施設一覧グリッドの開始位置を取得
	$grid_start = false;
	if (preg_match('/<div[^>]*class="[^"]*flex_box[^"]*"[^>]*>/i', $con, $matches, PREG_OFFSET_CAPTURE)) {
		$grid_start = $matches[0][1];
	}

	if ($grid_start !== false) {
		$facility_grid = substr($con, $grid_start);

		// サイネージ用の見出しを生成
		$signage_header = ''
			.'<div class="title signage-congestion-title">'
			.'<h1>外湯利用状況：Onsen Usage</h1>'
			.'<span id="last-update">'.htmlspecialchars($last_update, ENT_QUOTES, 'UTF-8').'</span>'
			.'</div>'
			.'<div class="signage-temperature-note">表示している各湯の温度は目安です</div>';

		$con = '<div id="content"><div id="content-inner">'
			.$signage_header
			.$facility_grid;
	}

	// 休湯・準備中画像のパスをサイネージテーマ側へ変更
	$con = str_replace('src="/img/closing-mark.png"', 'src="'.get_template_directory_uri().'/img/closing-mark.png"', $con);
	$con = str_replace('src="/img/closing2-mark.png"', 'src="'.get_template_directory_uri().'/img/closing2-mark.png"', $con);
	$con = str_replace('src="/img/junbichu-mark.png"', 'src="'.get_template_directory_uri().'/img/junbichu-mark.png"', $con);

	// 注意：
	// 「月」「日」や施設名の一括置換は、臨時休湯の日付表記や
	// ゆめぱ側で追加済みの英字施設名を壊すため行いません。
	$interval = get_field('congestion','option') * 1000;
	echo '<div id="img1" class="img bg-img" data-interval="'.$interval.'">'.$con.'</div>';

	//全施設共通スライダー------------------------------------------------------------------------------------------------------
	if(have_rows('all_signage_repeat','option')){
		$i = 2;
		while(have_rows('all_signage_repeat','option')): the_row();
			$signage_img_disp  = get_sub_field('all_signage_img_disp');
			$signage_disp_time = get_sub_field('all_signage_disp_time');
			$signage_from      = get_sub_field('all_signage_from');
			$signage_to        = get_sub_field('all_signage_to');
			$now_date          = date('Y/m/d');
			$signage_disp_time = $signage_disp_time * 1000;
			if($signage_img_disp === true){
				if(($now_date >= $signage_from && $now_date <= $signage_to) || ($now_date >= $signage_from && $signage_to == '') || ($signage_from == '' && $now_date <= $signage_to) || ($signage_from == '' && $signage_to == '')) {
?>
<div id="img<?=$i?>" class="img bg-img" data-interval="<?=$signage_disp_time?>" style="background-image:url(<?=the_sub_field('all_signage_img')?>);"></div>
<?php
				$i++;
				}
			}
		endwhile;
	}

	//個別施設スライダー------------------------------------------------------------------------------------------------------
	$sotoyu_ary = [
		//'satonoyu'  => 0,
		'zizouyu'   => 0,
		'yanagiyu'  => 1,
		'ichinoyu'  => 2,
		'gosyonoyu' => 3,
		'mandarayu' => 4,
		'kounoyu'   => 5,
	];
	$wp_sotoyu_name = $_GET['sotoyu_name'];
	$sotoyu_no = $sotoyu_ary[$wp_sotoyu_name];
	$sotoyu_name = $facility_name[$sotoyu_no];
	if(have_rows($wp_sotoyu_name.'_signage_repeat','option')){
		// $i = 1;
		while(have_rows($wp_sotoyu_name.'_signage_repeat','option')): the_row();
			$signage_img_disp  = get_sub_field($wp_sotoyu_name.'_signage_img_disp');
			$signage_disp_time = get_sub_field($wp_sotoyu_name.'_signage_disp_time');
			$signage_from      = get_sub_field($wp_sotoyu_name.'_signage_from');
			$signage_to        = get_sub_field($wp_sotoyu_name.'_signage_to');
			$now_date          = date('Y/m/d');
			$signage_disp_time = $signage_disp_time * 1000;
			if($signage_img_disp === true){
				if(($now_date >= $signage_from && $now_date <= $signage_to) || ($now_date >= $signage_from && $signage_to == '') || ($signage_from == '' && $now_date <= $signage_to) || ($signage_from == '' && $signage_to == '')) {
?>
<div id="img<?=$i?>" class="img bg-img" data-interval="<?=$signage_disp_time?>" style="background-image:url(<?=the_sub_field($wp_sotoyu_name.'_signage_img')?>);"></div>
<?php
				$i++;
				}
			}
		endwhile;
	}

	//次回休湯日表示------------------------------------------------------------------------------------------------------
	$interval = get_field('next_holiday','option') * 1000;
?>
<div id="img<?=$i?>" class="jikai-message-wrap relative" data-interval="<?=$interval?>">
	<div class="jikai-message">
		<dl>
			<dt>次回休湯日のご案内</dt>
			<dd><div class="jikai-message-y"><?=$year?></div>
			<div class="jikai-message-md"><strong><?=$date?></strong></div></dd>
		</dl>
	</div>
	<div class="sotoyu-name"><?=$sotoyu_name?></div>
</div>
<?php
}
?>

<?php
//混雑状況円グラフ用のJavaScript-----------------------------------------------------------------------------------
if($_GET['mode'] == 'slider'){
	$i=0;
	while ($array = fgetcsv($handle)) {
?>
<script>
// 円グラフ表示
var ctx = document.getElementById("Chart_<?=$facility[$i]?>_all");
if(ctx !== null) {
<?php
		if(!wp_is_mobile()) {
?>
ctx.height = 330;
<?php
		} else {
?>
ctx.height = 330;
<?php
		}
?>
var myChart = new Chart(ctx, {
	type: "<?=$array[0]?>",
	data: {
		labels: ["<?=$array[1]?>","<?=$array[2]?>"],
		datasets: [{
			// backgroundColor: ["#424242","#D8D8D8"],
			backgroundColor: ["<?=$array[3]?>","<?=$array[4]?>"],
			// hoverBackgroundColor: ["<?=$array[5]?>","<?=$array[6]?>"],
			data: [<?=$array[7]?>,<?=$array[8]?>]
		}]
	},
	options: {
		animation: {animateRotate:true}
	},
	percent: <?=$array[10]?>,
	date: "<?=$array[11]?>",
});

}
$('#Chartcount_<?=$facility[$i]?>_all').html('<em><?=$array[10]?></em><span class="caption">%</span>').delay(1000).fadeIn('slow');
</script>
<?php
	$i++;
	}
	exit;
}
?>

<html>
<head>
	<title>外湯サイネージ(Sotoyu Signage)</title>
	<meta charset="UTF-8">
	<script src="https://code.jquery.com/jquery-2.2.4.min.js" ></script>
	<script type="text/javascript" src="<?php echo get_template_directory_uri() ?>/js/main.js?<?php echo date('YmdHi'); ?>"></script>
	<script type="text/javascript" src="<?php echo get_template_directory_uri() ?>/js/thermometer.js?<?php echo date('YmdHi'); ?>"></script>
	<link rel="stylesheet" href="<?php echo get_template_directory_uri() ?>/signage.css?<?php echo date('YmdHi'); ?>" />
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js"></script>
	<?php // Chart.js の後に読み込む（window.Chart を包んで「入浴 :N」バッジを重ねるため） ?>
	<script type="text/javascript" src="<?php echo get_template_directory_uri() ?>/js/chart-badge.js?<?php echo date('YmdHi'); ?>"></script>
</head>
<body>
	<div id="content">
		<div id="marquee_wrap">
			<div id="msg"></div>
		</div>
		<div id="slide" class="slider-for">
		</div>
		<div id="progress_wrap">
			<div id="progress_bar"></div>
		</div>
		<div id="buffer" style="display:none;"></div>
	</div>
	<div id="close-btn">CLOSE</div>
</body>
</html>
