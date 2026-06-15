const quizQuestions = {
    office: [
        {
            question: "โศกนาฏกรรมมนุษย์เงินเดือนตอนนี้คือ...?",
            options: [
                { text: "รีบยัดข้าวก่อนสแกนนิ้ว ไม่ทันแล้ววว! (เช้า)", value: "breakfast", icon: "fas fa-sun" },
                { text: "ออดดังปุ๊บ วิ่งสับแตกไปแย่งโต๊ะกัน (เที่ยง)", value: "lunch", icon: "fas fa-clock" },
                { text: "เลิกงานโว้ยย รอดตายแล้ว ไปฉลอง! (เย็น)", value: "dinner", icon: "fas fa-moon" }
            ]
        },
        {
            question: "สภาพจิตใจและวิญญาณในตอนนี้?",
            options: [
                { text: "ชิลจัด งานเสร็จแล้ว แอบไถฟีดอยู่ (Relaxed)", value: "Relaxed", icon: "fas fa-laugh-beam" },
                { text: "โดนเจ้านายด่า! หัวร้อนระดับ 10 (Stressed)", value: "Stressed", icon: "fas fa-angry" },
                { text: "วิญญาณหลุดหลังประชุมยาว 3 ชม. (Drained)", value: "Drained", icon: "fas fa-dizzy" }
            ]
        },
        {
            question: "เหลือแรงก้าวขาไปหาร้านข้าวแค่ไหน?",
            options: [
                { text: "สู้เว้ย! ตากแดด 1 กิโลเพื่อของอร่อยก็ยอม (100%)", value: 100, icon: "fas fa-battery-full" },
                { text: "ขอแค่ใต้ตึก หรือลงข้ามถนนพอ ร้อน! (50%)", value: 50, icon: "fas fa-battery-half" },
                { text: "ให้เดินคือตาย... สั่งมาส่งที่โต๊ะเถอะ (10%)", value: 10, icon: "fas fa-battery-quarter" }
            ]
        },
        {
            question: "งบประมาณมื้อนี้ สภาพกระเป๋าตังค์ล่ะ?",
            options: [
                { text: "ต้นเดือนไง... ป๋าจัดให้! รูดบัตรไม่ยั้ง (>200฿)", value: "over_200", icon: "fas fa-money-bill-wave" },
                { text: "กลางเดือน กินพอดีๆ ไม่หรูไม่อด (100-200฿)", value: "100-200", icon: "fas fa-coins" },
                { text: "ปลายเดือน... เงินเก็บมีแค่เหรียญ (<100฿)", value: "under_100", icon: "fas fa-piggy-bank" }
            ]
        },
        {
            question: "สัมผัสแรกที่แตะลิ้นแล้วจะฟินที่สุด?",
            options: [
                { text: "ส้มตำปูปลาร้าพริก 10 เม็ด จิกกัดเจ้านาย", value: "quiz_heavy_spicy", icon: "fas fa-pepper-hot" },
                { text: "ซดน้ำซุปร้อนๆ คล่องคอ ล้างความซวย", value: "quiz_hot_soup", icon: "fas fa-mug-hot" },
                { text: "สลัดเบาๆ ให้ดูเป็นคนสวยรักสุขภาพ", value: "quiz_light_clean", icon: "fas fa-leaf" },
                { text: "บุฟเฟต์ปิ้งย่างเท่านั้น ยัดเยียวยาทุกสิ่ง!", value: "quiz_premium_buffet", icon: "fas fa-fire-alt" }
            ]
        }
    ],
    couple: [
        {
            question: "นัดเดทมื้อนี้ เกิดขึ้นช่วงเวลาไหน?",
            options: [
                { text: "ตื่นเช้ามาเติมความหวาน มุ้งมิ้ง (เช้า)", value: "breakfast", icon: "fas fa-coffee" },
                { text: "พักเที่ยง แว๊บมากินข้าวด้วยกันแป๊บนึง (เที่ยง)", value: "lunch", icon: "fas fa-sun" },
                { text: "ดินเนอร์แสงเทียน (หรือแสงหลอดไฟตะเกียบ)", value: "dinner", icon: "fas fa-wine-glass-alt" }
            ]
        },
        {
            question: "บรรยากาศระหว่างคุณกับแฟนตอนนี้?",
            options: [
                { text: "แฮปปี้สุดๆ อินเลิฟ มองตาหวานซึ้ง (Relaxed)", value: "Relaxed", icon: "fas fa-grin-hearts" },
                { text: "แฟนงอน! พ่นไฟใส่กันอยู่ รีบง้อด่วน (Stressed)", value: "Stressed", icon: "fas fa-sad-cry" },
                { text: "เหนื่อยจากการทำงานทั้งคู่ ขอกอดหน่อย (Drained)", value: "Drained", icon: "fas fa-tired" }
            ]
        },
        {
            question: "ความรุนแรงของอาการ 'โมโหหิว' ของแฟนคุณ?",
            options: [
                { text: "ร่างทอง! ถ้าเลือกร้านช้า โดนเหวี่ยงแน่ (100%)", value: 100, icon: "fas fa-exclamation-triangle" },
                { text: "เริ่มหงุดหงิดละ รีบคิดหน่อย (50%)", value: 50, icon: "fas fa-thermometer-half" },
                { text: "ชิลๆ ยังไงก็ได้ 'อะไรก็ได้ที่เธอชอบ' (10%)", value: 10, icon: "fas fa-bed" }
            ]
        },
        {
            question: "มาถึงคำถามวัดใจ... มื้อนี้ใครจ่าย?",
            options: [
                { text: "เราป๋าเอง! เลี้ยงแฟนจัดเต็มไม่อั้น (>200฿)", value: "over_200", icon: "fas fa-gem" },
                { text: "หารครึ่งสิครับ ยุคนี้ต้องแฟร์ๆ (100-200฿)", value: "100-200", icon: "fas fa-handshake" },
                { text: "ช็อตทั้งคู่ ประหยัดหน่อยเถอะที่รัก (<100฿)", value: "under_100", icon: "fas fa-wallet" }
            ]
        },
        {
            question: "อยากจูงมือกันไปกินอะไร?",
            options: [
                { text: "ชวนกันไปปากเจ่อกับของแซ่บๆ เผ็ดๆ", value: "quiz_heavy_spicy", icon: "fas fa-fire" },
                { text: "ชาบูร้อนๆ แย่งกันคีบหมูสไลด์", value: "quiz_hot_soup", icon: "fas fa-hot-tub" },
                { text: "แฟนไดเอทอยู่ บังคับกินคลีน!", value: "quiz_light_clean", icon: "fas fa-carrot" },
                { text: "ชวนกันอ้วน! ชีสเยิ้มๆ ปิ้งย่างสุดฟิน", value: "quiz_premium_buffet", icon: "fas fa-bacon" }
            ]
        }
    ]
};

const quizResultsMap = {
    heavy_spicy: {
        keywords: ['จัดจ้าน', 'เผ็ด', 'ย่าง', 'ทอด', 'ส้มตำ', 'กะเพรา', 'หมาล่า', 'fast food', 'street food', 'อาหารเหนือ', 'อาหารใต้'],
        title: "เดือดพ่นไฟ โหยโซเดียม",
        desc: "ร่างกายคุณกำลังหลั่งสารแห่งความเครียด ต้องการของทอดหรือปิ้งย่างรสจัดจ้านเพื่อเยียวยาจิตใจด่วน!",
        icon: "fas fa-fire",
        color: "from-rose-400 to-orange-500"
    },
    hot_soup: {
        keywords: ['ซุป', 'น้ำ', 'เส้น', 'ก๋วยเตี๋ยว', 'ราเมน', 'ชาบู', 'สุกี้', 'ต้ม', 'แกง'],
        title: "เครียดลงกระเพาะ ขอน้ำซุปฮีลใจ",
        desc: "ความเหนื่อยล้าต้องการการโอบกอดด้วยซุปร้อนๆ และคาร์โบไฮเดรตจากเส้นที่ลื่นคอ",
        icon: "fas fa-mug-hot",
        color: "from-orange-400 to-amber-500"
    },
    light_clean: {
        keywords: ['คลีน', 'สุขภาพ', 'สลัด', 'ญี่ปุ่น', 'ซูชิ', 'ปลา', 'ผัก', 'น้ำพริก', 'vegetarian', 'clean', 'healthy'],
        title: "ผู้แสวงหาความเซนและพลังงานสะอาด",
        desc: "จิตใจคุณสงบและสมดุล ร่างกายต้องการอาหารที่ไม่หนักเกินไปเพื่อรักษาระดับพลังงานที่ดีไว้",
        icon: "fas fa-leaf",
        color: "from-emerald-400 to-teal-500"
    },
    premium_buffet: {
        keywords: ['พรีเมียม', 'บุฟเฟต์', 'เนื้อ', 'ชีส', 'ของหวาน', 'บิงซู', 'คาเฟ่', 'cafe', 'dessert', 'buffet', 'steak'],
        title: "ชิลล์ขั้นสุด พร้อมหลั่งสารความสุข",
        desc: "วันนี้เป็นวันของคุณ! ให้รางวัลตัวเองด้วยมื้อใหญ่จัดเต็ม ไม่ว่าจะเป็นเนื้อย่างพรีเมียมหรือของหวานสุดฟิน",
        icon: "fas fa-crown",
        color: "from-purple-400 to-pink-500"
    }
};
