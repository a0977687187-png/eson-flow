'use strict';
// ⚠️ 這個檔案由 scripts/19_sync_form.py 從業主維護的 Excel 產生，不要手改。
//    來源：W:\非公務個人使用\99\製程流動單8.28.xlsx
//    改表請改那個 Excel，然後重跑：python scripts\\19_sync_form.py

const MAT = ['C60', 'C40', '35CS250H', 'C23', 'H60', 'H23', '50CS470', 'C60ST線槽', 'C18', 'C628', '35CS300', '50CS1300'];
const SKEW = ['1.5T', '2T', '1.4T', '1.3T', '1.2T', '1.6T', '1.8T', '2.5T', '3T', '1.2～1.3T', 'S', 'T', '7°', '12°'];
const BOX = ['煙燻小紙箱', '煙燻大紙箱', '大蝴蝶籠', '蝴蝶籠', '棧板', '木箱', '6號小紙箱', '18號小紙箱', '2號紙箱'];
const LISTS = { MAT, SKEW, BOX };

const FORM = {
 "ST": [
  {
   "op": "sec",
   "title": "壹、製令資訊",
   "note": "沖壓站填寫，兩張單同時複寫"
  },
  {
   "op": "field",
   "k": "wo",
   "l": "製令號",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "cust",
   "l": "客戶",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "mold",
   "l": "模具編號",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "spec",
   "l": "模具規格",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "mat",
   "l": "材質",
   "type": "select",
   "w": 8,
   "listName": "MAT"
  },
  {
   "op": "field",
   "k": "shaft",
   "l": "軸孔 φ",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "stack",
   "l": "疊厚 ㎜",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "skew",
   "l": "斜度規格",
   "type": "select",
   "w": 8,
   "listName": "SKEW"
  },
  {
   "op": "field",
   "k": "qty",
   "l": "訂單數量",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "due",
   "l": "交期",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "form",
   "l": "積層形式",
   "type": "radio",
   "w": 8,
   "list": [
    "全自鉚",
    "半自鉚"
   ]
  },
  {
   "op": "field",
   "k": "plant",
   "l": "廠別",
   "type": "radio",
   "w": 8,
   "list": [
    "一廠",
    "二廠"
   ]
  },
  {
   "op": "field",
   "k": "custpn",
   "l": "客戶料號",
   "type": "text",
   "w": 11
  },
  {
   "op": "field",
   "k": "slots",
   "l": "定子槽數",
   "type": "text",
   "w": 11
  },
  {
   "op": "field",
   "k": "pnfin",
   "l": "成品料號",
   "type": "text",
   "w": 11
  },
  {
   "op": "field",
   "k": "worem",
   "l": "製令備註",
   "type": "text",
   "w": 44
  },
  {
   "op": "field",
   "k": "o_groove",
   "l": "螺溝 ∩",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_hole",
   "l": "螺孔 φ",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_pos",
   "l": "定位溝 ∩",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_gnd",
   "l": "接地孔 φ",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_round",
   "l": "圓孔",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_bighole",
   "l": "大孔／小孔 φ",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_foot",
   "l": "足片別",
   "type": "radio",
   "w": 8,
   "list": [
    "S",
    "R",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_logo",
   "l": "LOGO",
   "type": "radio",
   "w": 8,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_mark",
   "l": "標記",
   "type": "checks",
   "w": 8,
   "list": [
    "APP字模",
    "ㄇ型記號孔"
   ]
  },
  {
   "op": "field",
   "k": "o_vent",
   "l": "風孔",
   "type": "radio",
   "w": 8,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_pos2",
   "l": "料位",
   "type": "radio",
   "w": 8,
   "list": [
    "邊料",
    "中料",
    "邊中料"
   ]
  },
  {
   "op": "field",
   "k": "o_weld",
   "l": "焊溝",
   "type": "radio",
   "w": 8,
   "list": [
    "S",
    "R",
    "無"
   ]
  },
  {
   "op": "sec",
   "title": "二、模具沖壓站",
   "note": "斜度設定值＝機台怎麼調才沖得出上面那個斜度規格"
  },
  {
   "op": "field",
   "k": "proddate",
   "l": "生產日期",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "press",
   "l": "沖床台號",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "skewset",
   "l": "斜度設定值",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "mdchk",
   "l": "模具檢點結果",
   "type": "radio",
   "w": 7,
   "list": [
    "正常",
    "修磨",
    "維修"
   ]
  },
  {
   "op": "field",
   "k": "recv",
   "l": "接收數(片)",
   "type": "text",
   "w": 5
  },
  {
   "op": "field",
   "k": "done",
   "l": "完成數(只)",
   "type": "text",
   "w": 5
  },
  {
   "op": "field",
   "k": "ng",
   "l": "不良數",
   "type": "text",
   "w": 5
  },
  {
   "op": "field",
   "k": "ngact",
   "l": "不良處置",
   "type": "checks",
   "w": 5,
   "list": [
    "報廢",
    "重工",
    "挑選",
    "退上站"
   ]
  },
  {
   "op": "field",
   "k": "sign1",
   "l": "簽名",
   "type": "text",
   "w": 5
  },
  {
   "op": "sec",
   "title": "三、靜子 ST 加工站",
   "note": "不經過的站請勾「不適用」，勿留白"
  },
  {
   "op": "stations",
   "passcol": "不適用",
   "list": [
    {
     "name": "靜子焊接",
     "pass_opts": []
    },
    {
     "name": "倒　角",
     "pass_opts": []
    },
    {
     "name": "磨稜角／車削／去毛邊",
     "pass_opts": []
    },
    {
     "name": "燒　炖",
     "pass_opts": []
    }
   ]
  },
  {
   "op": "field",
   "k": "p_opt",
   "l": "靜子後製程",
   "type": "checks",
   "w": 16,
   "list": [
    "焊銅",
    "染黑",
    "絕緣塗膜",
    "綠色膠帶"
   ]
  },
  {
   "op": "field",
   "k": "p_other",
   "l": "其他",
   "type": "text",
   "w": 16
  },
  {
   "op": "sec",
   "title": "四、包裝",
   "note": "箱型與箱數為選箱規則的來源，務必填寫"
  },
  {
   "op": "field",
   "k": "boxtype",
   "l": "箱　型",
   "type": "select",
   "w": 7,
   "listName": "BOX"
  },
  {
   "op": "field",
   "k": "perbox",
   "l": "每箱數量",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "boxes",
   "l": "箱　數",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "labeltxt",
   "l": "標籤寫法",
   "type": "text",
   "w": 7
  },
  {
   "op": "sec",
   "title": "五、入成品倉庫",
   "note": "終點"
  },
  {
   "op": "field",
   "k": "indate",
   "l": "入庫日期",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "inqty",
   "l": "入庫數量",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "inloc",
   "l": "位置",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "insign",
   "l": "入庫簽名",
   "type": "text",
   "w": 8
  },
  {
   "op": "rule",
   "text": "填寫規定：① 不良數為 0 也要寫 0。② 不經過的站一律勾「不適用」。③ 品管欄不可由操作員代簽。④ 塗改劃單線並簽名，勿塗黑或用修正液。"
  }
 ],
 "RO": [
  {
   "op": "sec",
   "title": "一、製令資訊",
   "note": "沖壓站填寫，兩張單同時複寫"
  },
  {
   "op": "field",
   "k": "wo",
   "l": "製令號",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "cust",
   "l": "客戶",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "mold",
   "l": "模具編號",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "spec",
   "l": "模具規格",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "mat",
   "l": "材質",
   "type": "select",
   "w": 8,
   "listName": "MAT"
  },
  {
   "op": "field",
   "k": "shaft",
   "l": "軸孔 φ",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "stack",
   "l": "疊厚 ㎜",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "skew",
   "l": "斜度規格",
   "type": "select",
   "w": 8,
   "listName": "SKEW"
  },
  {
   "op": "field",
   "k": "qty",
   "l": "訂單數量",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "due",
   "l": "交期",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "form",
   "l": "積層形式",
   "type": "radio",
   "w": 8,
   "list": [
    "全自鉚",
    "半自鉚"
   ]
  },
  {
   "op": "field",
   "k": "plant",
   "l": "廠別",
   "type": "radio",
   "w": 8,
   "list": [
    "一廠",
    "二廠"
   ]
  },
  {
   "op": "field",
   "k": "custpn",
   "l": "客戶料號",
   "type": "text",
   "w": 11
  },
  {
   "op": "field",
   "k": "slots",
   "l": "轉子槽數",
   "type": "text",
   "w": 11
  },
  {
   "op": "field",
   "k": "pnfin",
   "l": "成品料號",
   "type": "text",
   "w": 11
  },
  {
   "op": "field",
   "k": "o_markhole",
   "l": "記號孔",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_idhole",
   "l": "辨識孔",
   "type": "radio",
   "w": 8,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_foot",
   "l": "足片別",
   "type": "radio",
   "w": 8,
   "list": [
    "S",
    "R",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_round",
   "l": "圓孔",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_bighole",
   "l": "大孔／小孔 φ",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_logo",
   "l": "LOGO",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "o_mark",
   "l": "標記",
   "type": "checks",
   "w": 9,
   "list": [
    "APP字模",
    "ㄇ型記號孔"
   ]
  },
  {
   "op": "field",
   "k": "o_vent",
   "l": "風孔",
   "type": "radio",
   "w": 9,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_laser",
   "l": "雷雕",
   "type": "radio",
   "w": 9,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_pos2",
   "l": "料位",
   "type": "radio",
   "w": 9,
   "list": [
    "邊料",
    "中料",
    "邊中料"
   ]
  },
  {
   "op": "field",
   "k": "worem",
   "l": "製令備註",
   "type": "text",
   "w": 44
  },
  {
   "op": "sec",
   "title": "二、模具沖壓站",
   "note": "斜度設定值＝機台怎麼調才沖得出上面那個斜度規格"
  },
  {
   "op": "field",
   "k": "proddate",
   "l": "生產日期",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "press",
   "l": "沖床台號",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "skewset",
   "l": "斜度設定值",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "mdchk",
   "l": "模具檢點結果",
   "type": "radio",
   "w": 7,
   "list": [
    "正常",
    "修磨",
    "維修"
   ]
  },
  {
   "op": "field",
   "k": "recv",
   "l": "接收數(片)",
   "type": "text",
   "w": 5
  },
  {
   "op": "field",
   "k": "done",
   "l": "完成數(只)",
   "type": "text",
   "w": 5
  },
  {
   "op": "field",
   "k": "ng",
   "l": "不良數",
   "type": "text",
   "w": 5
  },
  {
   "op": "field",
   "k": "ngact",
   "l": "不良處置",
   "type": "checks",
   "w": 5,
   "list": [
    "報廢",
    "重工",
    "挑選",
    "退上站"
   ]
  },
  {
   "op": "field",
   "k": "sign1",
   "l": "簽名",
   "type": "text",
   "w": 5
  },
  {
   "op": "sec",
   "title": "三、轉子 RO 加工站",
   "note": ""
  },
  {
   "op": "stations",
   "passcol": "經過",
   "list": [
    {
     "name": "轉子入假軸（鑄鋁用）",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "轉子鑄鋁",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "轉子退出假軸",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "轉子入軸心（與假軸擇一）",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "清除鋁屑／拋光噴漆",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "轉子攪孔",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "轉子上漆",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "燒　炖（轉子）",
     "pass_opts": [
      "有",
      "無"
     ]
    }
   ]
  },
  {
   "op": "sec",
   "title": "四、後製程選配",
   "note": "不是獨立工站，但會決定是不是不同的成品"
  },
  {
   "op": "field",
   "k": "p_ring",
   "l": "端環",
   "type": "radio",
   "w": 12,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "p_fan",
   "l": "扇葉／平衡柱",
   "type": "radio",
   "w": 12,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "p_opt",
   "l": "其他後製程",
   "type": "checks",
   "w": 12,
   "list": [
    "染黑",
    "綠色膠帶"
   ]
  },
  {
   "op": "field",
   "k": "p_other",
   "l": "其他",
   "type": "text",
   "w": 12
  },
  {
   "op": "sec",
   "title": "五、委外加工",
   "note": "本單留廠內，不隨貨出廠；貨另附委外單"
  },
  {
   "op": "field",
   "k": "out1",
   "l": "加工類別",
   "type": "checks",
   "w": 8,
   "list": [
    "焊銅",
    "鑄鋁",
    "其他"
   ]
  },
  {
   "op": "field",
   "k": "outv",
   "l": "委外廠商",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "outd",
   "l": "送出日期",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "outb",
   "l": "回廠日期",
   "type": "text",
   "w": 8
  },
  {
   "op": "sec",
   "title": "六、包裝",
   "note": "箱型與箱數為選箱規則的來源，務必填寫"
  },
  {
   "op": "field",
   "k": "boxtype",
   "l": "箱　型",
   "type": "select",
   "w": 7,
   "listName": "BOX"
  },
  {
   "op": "field",
   "k": "perbox",
   "l": "每箱數量",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "boxes",
   "l": "箱　數",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "labeltxt",
   "l": "標籤寫法",
   "type": "text",
   "w": 7
  },
  {
   "op": "sec",
   "title": "七、入成品倉庫",
   "note": "終點"
  },
  {
   "op": "field",
   "k": "indate",
   "l": "入庫日期",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "inqty",
   "l": "入庫數量",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "inloc",
   "l": "位置",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "insign",
   "l": "入庫簽名",
   "type": "text",
   "w": 8
  }
 ]
};

// 版面指令 → 畫面用的區塊結構
function sections(kind) {
  const out = [];
  let cur = null;
  for (const it of FORM[kind]) {
    if (it.op === 'sec') {
      cur = { t: it.title, who: it.note, f: [] };
      out.push(cur);
    } else if (it.op === 'stations') {
      if (!cur) { cur = { t: '', who: '', f: [] }; out.push(cur); }
      cur.stations = it.list;
      cur.passcol = it.passcol;
    } else if (it.op === 'rule') {
      // 結尾填寫規定，畫面上放頁尾，不進表單
    } else if (it.op === 'field') {
      if (!cur) { cur = { t: '', who: '', f: [] }; out.push(cur); }
      cur.f.push(it.w >= 40 ? { ...it, w: 2 } : it);
    }
  }
  return out;
}

function formRule(kind) {
  const r = FORM[kind].find(i => i.op === 'rule');
  return r ? r.text : '';
}
