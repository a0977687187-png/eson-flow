'use strict';
// ⚠️ 這個檔案由 scripts/19_sync_form.py 從業主維護的 Excel 產生，不要手改。
//    來源：W:\非公務個人使用\99\製程流動單8.28.xlsx
//    改表請改那個 Excel，然後重跑：python scripts\\19_sync_form.py

const MAT = ['C60', 'C40', '35CS250H', 'C23', 'H60', 'H23', '50CS470', 'C60ST線槽', 'C18', 'C628', '35CS300', '50CS1300'];
const SKEW = ['無', '1.5T','2T', '1.4T', '1.3T', '1.2T', '1.6T', '1.8T', '2.5T', '3T', '1.2～1.3T', 'S', 'T', '7°', '12°'];
const BOX = ['煙燻小紙箱', '煙燻大紙箱', '大蝴蝶籠', '蝴蝶籠', '棧板', '木箱', '6號小紙箱', '18號小紙箱', '2號紙箱'];
// 大孔：歷史 5,482 筆只出現 7 種組合，依出現次數排序。片數一律＝尺寸÷0.5，不用另外填。
const BIGHOLE = ['無', '上下各3㎜（6片）', '上下各5㎜（10片）', '上下各10㎜（20片）',
  '上下各4㎜（8片）', '上下各1㎜（2片）', '上下各2㎜（4片）', '上下各6㎜（12片）'];
const LISTS = { MAT, SKEW, BOX, BIGHOLE };

const FORM = {
 "ST": [
  {
   "op": "sec",
   "title": "壹、產品識別",
   "note": "這一筆是哪一個成品——客戶＋模具規格＋槽數就是它的身分",
   "tone": "navy"
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
   "k": "slots",
   "l": "定子槽數",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "custpn",
   "l": "客戶料號",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "pnfin",
   "l": "成品料號",
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
    "半自鉚",
    "散片"
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
   "op": "sec",
   "title": "貳、材料與規格",
   "note": "",
   "tone": "teal"
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
   "op": "sec",
   "title": "參、沖壓做法",
   "note": "斜度設定值＝機台怎麼調才沖得出上面那個斜度規格",
   "tone": "blue"
  },
  {
   "op": "field",
   "k": "press",
   "l": "沖床台號",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "skewset",
   "l": "斜度設定值",
   "type": "text",
   "w": 8
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
   "w": 7
  },
  {
   "op": "field",
   "k": "o_pos",
   "l": "定位溝 ∩",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "o_gnd",
   "l": "接地孔 φ",
   "type": "text",
   "w": 7
  },
  {
   "op": "field",
   "k": "o_bighole",
   "l": "大孔／小孔 φ",
   "type": "text",
   "w": 7
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
   "k": "o_vent",
   "l": "風孔",
   "type": "yesno",
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
   "type": "yesno",
   "w": 8,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_logo",
   "l": "LOGO",
   "type": "yesno",
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
    "ㄇ型記號孔",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_weld",
   "l": "焊溝",
   "type": "yesno",
   "w": 8,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "shipto",
   "l": "送貨地點",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "packway",
   "l": "包裝方式",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "press_note",
   "l": "沖壓備註",
   "type": "note",
   "w": 44
  },
  {
   "op": "sec",
   "title": "肆、靜子 ST 加工站",
   "note": "走過的站打勾，並寫下這一站的重點 Know-how",
   "tone": "orange"
  },
  {
   "op": "stations",
   "passcol": "經過",
   "list": [
    {
     "name": "靜子焊接",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "倒　角",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "磨稜角／車削／去毛邊",
     "pass_opts": [
      "有",
      "無"
     ]
    },
    {
     "name": "燒　炖",
     "pass_opts": [
      "有",
      "無"
     ]
    }
   ],
   "notecol": "重點 Know-how"
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
    "綠色膠帶",
    "無"
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
   "op": "field",
   "k": "post_note",
   "l": "後製程備註",
   "type": "note",
   "w": 43
  },
  {
   "op": "sec",
   "title": "伍、包裝",
   "note": "箱型與每箱數量是選箱規則的來源，務必填寫",
   "tone": "green"
  },
  {
   "op": "field",
   "k": "boxtype",
   "l": "箱　型",
   "type": "text",
   "w": 15
  },
  {
   "op": "field",
   "k": "perbox",
   "l": "每箱數量",
   "type": "text",
   "w": 15
  },
  {
   "op": "field",
   "k": "labeltxt",
   "l": "標籤寫法",
   "type": "text",
   "w": 15
  },
  {
   "op": "field",
   "k": "pack_note",
   "l": "包裝備註",
   "type": "note",
   "w": 44
  },
  {
   "op": "sec",
   "title": "陸、備註",
   "note": "",
   "tone": "grey"
  },
  {
   "op": "field",
   "k": "worem",
   "l": "其他備註",
   "type": "note",
   "w": 44
  },
  {
   "op": "rule",
   "text": "說明：這張單記的是「這個料號怎麼做」，不是「這一批做了多少」。走過的站請打勾；各站與各區的重點、眉角寫在 Know-how／備註格，下次照著做。做法有變更時直接更新這一筆。"
  }
 ],
 "RO": [
  {
   "op": "sec",
   "title": "壹、產品識別",
   "note": "這一筆是哪一個成品——客戶＋模具規格＋槽數就是它的身分",
   "tone": "navy"
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
   "k": "slots",
   "l": "轉子槽數",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "custpn",
   "l": "客戶料號",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "pnfin",
   "l": "成品料號",
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
    "半自鉚",
    "散片"
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
   "k": "p_ring",
   "l": "端環",
   "type": "text",
   "w": 6
  },
  {
   "op": "field",
   "k": "p_fan",
   "l": "扇葉／平衡柱",
   "type": "text",
   "w": 6
  },
  {
   "op": "field",
   "k": "p_opt",
   "l": "其他後製程",
   "type": "checks",
   "w": 6,
   "list": [
    "染黑",
    "綠色膠帶",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "p_other",
   "l": "其他",
   "type": "text",
   "w": 6
  },
  {
   "op": "sec",
   "title": "貳、材料與規格",
   "note": "",
   "tone": "teal"
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
   "op": "sec",
   "title": "參、沖壓做法",
   "note": "斜度設定值＝機台怎麼調才沖得出上面那個斜度規格",
   "tone": "blue"
  },
  {
   "op": "field",
   "k": "press",
   "l": "沖床台號",
   "type": "text",
   "w": 8
  },
  {
   "op": "field",
   "k": "skewset",
   "l": "斜度設定值",
   "type": "text",
   "w": 8
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
   "k": "o_vent",
   "l": "風孔",
   "type": "yesno",
   "w": 8,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_logo",
   "l": "LOGO",
   "type": "yesno",
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
   "type": "yesno",
   "w": 8,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_markhole",
   "l": "記號孔",
   "type": "radio",
   "w": 8,
   "list": [
    "ㄇ型記號孔",
    "U型記號孔",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_idhole",
   "l": "辨識孔",
   "type": "yesno",
   "w": 8,
   "list": [
    "有",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "o_laser",
   "l": "雷雕",
   "type": "yesno",
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
    "無"
   ]
  },
  {
   "op": "field",
   "k": "shipto",
   "l": "送貨地點",
   "type": "text",
   "w": 19
  },
  {
   "op": "field",
   "k": "packway",
   "l": "包裝方式",
   "type": "text",
   "w": 19
  },
  {
   "op": "field",
   "k": "press_note",
   "l": "沖壓備註",
   "type": "note",
   "w": 44
  },
  {
   "op": "sec",
   "title": "肆、轉子 RO 加工站",
   "note": "走過的站打勾，並寫下這一站的重點 Know-how",
   "tone": "orange"
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
   ],
   "notecol": "重點 Know-how"
  },
  {
   "op": "sec",
   "title": "伍、委外加工",
   "note": "本單留廠內，不隨貨出廠",
   "tone": "wine"
  },
  {
   "op": "field",
   "k": "out1",
   "l": "加工類別",
   "type": "checks",
   "w": 28,
   "list": [
    "焊銅",
    "鑄鋁",
    "其他",
    "無"
   ]
  },
  {
   "op": "field",
   "k": "outv",
   "l": "委外廠商",
   "type": "text",
   "w": 28
  },
  {
   "op": "field",
   "k": "out_note",
   "l": "委外備註",
   "type": "note",
   "w": 44
  },
  {
   "op": "sec",
   "title": "陸、包裝",
   "note": "箱型與每箱數量是選箱規則的來源，務必填寫",
   "tone": "green"
  },
  {
   "op": "field",
   "k": "boxtype",
   "l": "箱　型",
   "type": "text",
   "w": 15
  },
  {
   "op": "field",
   "k": "perbox",
   "l": "每箱數量",
   "type": "text",
   "w": 15
  },
  {
   "op": "field",
   "k": "labeltxt",
   "l": "標籤寫法",
   "type": "text",
   "w": 15
  },
  {
   "op": "field",
   "k": "pack_note",
   "l": "包裝備註",
   "type": "note",
   "w": 44
  },
  {
   "op": "sec",
   "title": "柒、備註",
   "note": "",
   "tone": "grey"
  },
  {
   "op": "field",
   "k": "worem",
   "l": "其他備註",
   "type": "note",
   "w": 44
  },
  {
   "op": "rule",
   "text": "說明：這張單記的是「這個料號怎麼做」，不是「這一批做了多少」。走過的站請打勾；各站與各區的重點、眉角寫在 Know-how／備註格，下次照著做。做法有變更時直接更新這一筆。"
  }
 ]
};

// 版面指令 → 畫面用的區塊結構
function sections(kind) {
  const out = [];
  let cur = null;
  for (const it of FORM[kind]) {
    if (it.op === 'sec') {
      cur = { t: it.title, who: it.note, tone: it.tone || 'navy', f: [] };
      out.push(cur);
    } else if (it.op === 'stations') {
      if (!cur) { cur = { t: '', who: '', f: [] }; out.push(cur); }
      cur.stations = it.list;
      cur.passcol = it.passcol;
      cur.notecol = it.notecol;
    } else if (it.op === 'rule') {
      // 結尾填寫規定，畫面上放頁尾，不進表單
    } else if (it.op === 'field') {
      if (!cur) { cur = { t: '', who: '', f: [] }; out.push(cur); }
      // 備註（Know-how）佔滿整列；其餘很寬的欄位佔半列
      cur.f.push(it.type === 'note' ? { ...it, w: 4 } : it.w >= 40 ? { ...it, w: 2 } : it);
    }
  }
  return out;
}

function formRule(kind) {
  const r = FORM[kind].find(i => i.op === 'rule');
  return r ? r.text : '';
}
