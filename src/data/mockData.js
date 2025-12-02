
// ==========================================
// 1. MOCK NEWS (รองรับ Content Blocks: Text, Image, Youtube)
// ==========================================
export const SAMPLE_NEWS = [
  {
    id: 1,
    title: "Aespa ประกาศศักดา! คัมแบ็คอัลบั้มใหม่ \"I'm so (So, Hot 6! Even!)\"",
    category: "K-pop",
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=60",
    date: "1 พ.ย. 2025",
    tags: ["#Aespa", "#KPop", "#NewAlbum"],
    contentBlocks: [
      { 
        type: 'text', 
        text: "สิ้นสุดการรอคอยสำหรับเหล่า \"MY\" (ชื่อแฟนคลับ) ทั่วโลก! เมื่อ SM Entertainment ค่ายเพลงยักษ์ใหญ่แห่งเกาหลีใต้ ได้ออกมาประกาศอย่างเป็นทางการว่า Aespa เกิร์ลกรุ๊ปเมตาเวิร์สสุดล้ำ กำลังจะกลับมาทวงบัลลังก์ชาร์ตเพลงอีกครั้ง ด้วยอัลบั้มเต็มชุดใหม่ที่ทุกคนรอคอย" 
      },
      { 
        type: 'image', 
        src: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=60", 
        caption: "บรรยากาศงานแถลงข่าวเปิดตัวอัลบั้มใหม่" 
      },
      { 
        type: 'text', 
        text: "โดยในอัลบั้มนี้จะประกอบไปด้วย 6 เพลงใหม่ ที่ยังคงคอนเซปต์โลกเสมือนจริง (KWANGYA) แต่เพิ่มจังหวะดนตรีที่หนักแน่นและท่าเต้นที่แข็งแรงขึ้นกว่าเดิม สมาชิกทั้ง 4 คนเปิดเผยว่าพวกเธอซุ่มซ้อมกันอย่างหนักเพื่อการคัมแบ็คครั้งนี้" 
      },
      { 
        type: 'image', 
        src: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&auto=format&fit=crop&q=60", 
        caption: "ภาพทีเซอร์คอนเซปต์ใหม่ที่สร้างความฮือฮา" 
      },
      { 
        type: 'text', 
        text: "เตรียมตัวให้พร้อม! มิวสิควิดีโอตัวเต็มจะถูกปล่อยออกมาในวันที่ 15 พฤศจิกายนนี้ เวลา 18:00 น. (ตามเวลาเกาหลี) ห้ามพลาดเด็ดขาด!" 
      }
    ]
  },
  {
    id: 2,
    title: "4EVE The Series พร้อมออกอากาศกุมภาพันธ์นี้",
    category: "T-pop",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&auto=format&fit=crop&q=60",
    date: "31 ต.ค. 2025",
    tags: ["#4EVE", "#Tpop", "#Series"],
    contentBlocks: [
      { 
        type: 'text', 
        text: "สิ้นสุดการรอคอย! ซีรีส์เรื่องแรกของสาวๆ 4EVE ที่แฟนคลับห้ามพลาด เรื่องราวของมิตรภาพและความฝันที่จะพาทุกคนไปสัมผัสเบื้องหลังวงการ T-Pop อย่างเจาะลึก" 
      },
      { 
        type: 'image', 
        src: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&auto=format&fit=crop&q=60", 
        caption: "ภาพเบื้องหลังการถ่ายทำ" 
      },
      { 
        type: 'text', 
        text: "ซีรีส์เรื่องนี้จะเริ่มออกอากาศตอนแรกในวันที่ 14 กุมภาพันธ์ เพื่อต้อนรับวันวาเลนไทน์ โดยจะฉายทางช่อง Workpoint TV และย้อนหลังทาง Netflix" 
      }
    ]
  },
  {
    id: 3,
    title: "BLACKPINK World Tour รอบสุดท้ายที่กรุงเทพฯ",
    category: "K-pop",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=60",
    date: "30 ต.ค. 2025",
    tags: ["#BLACKPINK", "#WorldTour"],
    contentBlocks: [
      { type: 'text', text: "ค่ำคืนแห่งประวัติศาสตร์ได้ผ่านพ้นไปแล้ว กับคอนเสิร์ตปิดท้าย World Tour อย่างยิ่งใหญ่ที่ราชมังคลากีฬาสถาน ท่ามกลางทะเลสีชมพูจากบลิ๊งค์ทั่วโลกที่บินมาร่วมงาน" }
    ]
  },
  {
    id: 4,
    title: "NewJeans Comeback Stage",
    category: "K-pop",
    image: "https://images.unsplash.com/photo-1621360841013-c768371e93cf?w=800&auto=format&fit=crop&q=60",
    date: "28 ต.ค. 2025",
    tags: ["#NewJeans", "#Inkigayo"],
    contentBlocks: [
      { type: 'text', text: "ไม่มีคำว่าแผ่วสำหรับ \"Rookie Monster\" อย่าง NewJeans ที่ล่าสุดกวาดถ้วยรางวัลรายการเพลงไปอีก 5 ถ้วยรวด" }
    ]
  },
  {
    id: 5,
    title: "LISA x ROCKSTAR เขย่าวงการแฟชั่นวีคปารีส",
    category: "K-pop",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60",
    date: "27 ต.ค. 2025",
    tags: ["#LISA", "#FashionWeek"],
    contentBlocks: [
      { type: 'text', text: "ลิซ่า ลลิษา มโนบาล สร้างความฮือฮาอีกครั้งในงาน Paris Fashion Week ด้วยลุคสุดเท่ที่ผสมผสานความเป็นร็อคสตาร์เข้ากับความหรูหราได้อย่างลงตัว" }
    ]
  },
  {
    id: 6,
    title: "SEVENTEEN 'FOLLOW' Tour เพิ่มรอบที่ราชมังฯ",
    category: "K-pop",
    image: "https://images.unsplash.com/photo-1459749411177-d4a428c37ae8?w=800&auto=format&fit=crop&q=60",
    date: "26 ต.ค. 2025",
    tags: ["#SEVENTEEN", "#FollowTour"],
    contentBlocks: [
      { type: 'text', text: "ข่าวดีสำหรับชาวกะรัตไทย! ผู้จัดประกาศเพิ่มรอบการแสดงคอนเสิร์ต SEVENTEEN เป็น 3 รอบ หลังบัตร 2 รอบแรกขายหมดเกลี้ยงภายใน 5 นาที" }
    ]
  },
  {
    id: 7,
    title: "TREASURE ปล่อยทีเซอร์อัลบั้มใหม่ REBOOT",
    category: "K-pop",
    image: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800&auto=format&fit=crop&q=60",
    date: "25 ต.ค. 2025",
    tags: ["#TREASURE", "#REBOOT"],
    contentBlocks: [
      { type: 'text', text: "TREASURE กลับมาพร้อมกับภาพลักษณ์ใหม่ที่เติบโตขึ้น ในอัลบั้มเต็มชุดที่ 2 REBOOT ที่จะเผยให้เห็นด้านที่ดุดันและแข็งแรงกว่าเดิม" }
    ]
  },
  {
    id: 8,
    title: "IVE สร้างสถิติใหม่ด้วยยอดขายอัลบั้มทะลุล้าน",
    category: "K-pop",
    image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&auto=format&fit=crop&q=60",
    date: "24 ต.ค. 2025",
    tags: ["#IVE", "#KPopRecord"],
    contentBlocks: [
      { type: 'text', text: "IVE เกิร์ลกรุ๊ปมาแรงแห่งยุค ยังคงเดินหน้าสร้างสถิติใหม่อย่างต่อเนื่อง ล่าสุดมินิอัลบั้มใหม่ทำยอดขายทะลุ 1 ล้านชุดเป็นที่เรียบร้อย" }
    ]
  }
];

// ==========================================
// 2. MOCK EVENTS
// ==========================================
export const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "LE SSERAFIM - UNFORGIVEN Tour Bangkok",
    type: "Concert",
    date: "31 ธ.ค. 2568",
    time: "18:00 น.",
    schedules: [
      { date: "31 ธ.ค. 2568", time: "18:00 - 22:00 น." },
      { date: "01 ม.ค. 2569", time: "18:00 - 22:00 น." }
    ],
    location: "Thunder Dome",
    full_location: "Thunder Dome, Muang Thong Thani",
    price: "3,500 - 8,500",
    image: "https://tm-prod-event-files-v3.ticketmelon.com/2b5aec3a91e711f0911101117567899b/poster/7d4414ac91e911f0923401117567899b.png",
    description: "LE SSERAFIM กำลังจะมาพร้อมกับทัวร์คอนเสิร์ต UNFORGIVEN ครั้งแรกในประเทศไทย! เตรียมพบกับการแสดงสุดพิเศษจากสมาชิกทั้ง 5 คน ที่จะมาระเบิดความมันส์ส่งท้ายปีเก่าต้อนรับปีใหม่ไปด้วยกัน\n\nงานนี้ห้ามพลาดด้วยประการทั้งปวง เพราะนอกจากเพลงฮิตอย่าง ANTIFRAGILE และ UNFORGIVEN แล้ว ยังมีสเตจพิเศษที่เตรียมมาเซอร์ไพรส์แฟนๆ ชาวไทยโดยเฉพาะ",
    booking_date: "15 พ.ย. 2568",
    ticket_link: "https://www.thaiticketmajor.com",
    start_iso: "20251231T180000",
    end_iso: "20260101T220000",
    announced_iso: "20251015T000000",
    ticket_info: [{ zone: "VIP", price: "8,500 บาท" }, { zone: "Regular", price: "6,500 บาท" }],
    tags: ["Concert"]
  },
  {
    id: 2,
    title: "NCT DREAM Fansign",
    type: "Fansign",
    date: "15 ธ.ค. 2568",
    time: "14:00 น.",
    location: "Central World",
    price: "ลุ้นสิทธิ์",
    tags: ["Fansign"],
    image: "https://images.unsplash.com/photo-1529686342540-1b43aec0df75?w=800&auto=format&fit=crop&q=60",
    description: "งานแจกลายเซ็นสุด Exclusive กับหนุ่มๆ NCT DREAM ที่จะมาพบปะแฟนๆ ชาวไทยอย่างใกล้ชิด ผู้โชคดี 100 ท่านจะได้รับลายเซ็นพร้อมพูดคุยกับศิลปิน",
    booking_date: "รอประกาศ",
    ticket_link: "#",
    start_iso: "20251215T140000",
    end_iso: "20251215T180000",
    announced_iso: "20251120T000000",
    ticket_info: []
  },
  {
    id: 3,
    title: "K-Pop Festival 2025",
    type: "Festival",
    date: "20 ม.ค. 2569",
    time: "16:00 น.",
    location: "Impact Arena",
    price: "2,500+",
    tags: ["Concert"],
    image: "https://images.unsplash.com/photo-1459749411177-d4a428c37ae8?w=800&auto=format&fit=crop&q=60",
    description: "เทศกาลดนตรี K-Pop ที่ยิ่งใหญ่ที่สุดในต้นปี 2026 รวบรวมศิลปินกว่า 10 วง มาไว้บนเวทีเดียว เตรียมแท่งไฟของคุณให้พร้อม!",
    booking_date: "1 ธ.ค.",
    ticket_link: "#",
    start_iso: "20260120T160000",
    end_iso: "20260120T230000",
    announced_iso: "20251101T000000",
    ticket_info: []
  },
  {
    id: 4,
    title: "ENHYPEN Fan Meeting",
    type: "Fan Meeting",
    date: "10 ก.พ. 2569",
    time: "18:00 น.",
    location: "Thunder Dome",
    price: "2,500+",
    tags: ["Fan Meeting"],
    image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&auto=format&fit=crop&q=60",
    description: "แฟนมีตติ้งเต็มรูปแบบครั้งแรกของ ENHYPEN ในไทย มาร่วมสร้างความทรงจำดีๆ กับหนุ่มๆ ทั้ง 7 คน",
    booking_date: "5 ม.ค.",
    ticket_link: "#",
    start_iso: "20260210T180000",
    end_iso: "20260210T210000",
    announced_iso: "20251201T000000",
    ticket_info: []
  },
  {
    id: 5,
    title: "Dance Workshop",
    type: "Workshop",
    date: "5 ม.ค. 2569",
    time: "10:00 น.",
    location: "Studio 99",
    price: "1,500",
    tags: ["Workshop"],
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=60",
    description: "เวิร์คช็อปสอนเต้นเพลง K-Pop สุดฮิต โดยครูสอนเต้นมืออาชีพจากเกาหลี เรียนจบเต้นเป็นแน่นอน",
    booking_date: "Walk-in",
    ticket_link: "#",
    start_iso: "20260105T100000",
    end_iso: "20260105T160000",
    announced_iso: "20251110T000000",
    ticket_info: []
  },
  {
    id: 6,
    title: "Stray Kids '5-STAR' Exhibition",
    type: "Exhibition",
    date: "1-31 ม.ค. 2569",
    time: "10:00 - 20:00 น.",
    location: "M Floor, Siam Paragon",
    price: "500",
    tags: ["Exhibition"],
    image: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=800&auto=format&fit=crop&q=60",
    description: "นิทรรศการสุดยิ่งใหญ่ที่รวบรวมภาพถ่ายและชุดคอนเซปต์จากอัลบั้ม 5-STAR ของ Stray Kids มาให้ชมกันแบบจุใจ",
    booking_date: "Walk-in",
    ticket_link: "#",
    start_iso: "20260101T100000",
    end_iso: "20260131T200000",
    announced_iso: "20251115T000000",
    ticket_info: []
  },
  {
    id: 7,
    title: "Bambam Birthday Project",
    type: "Fan Event",
    date: "2 พ.ค. 2569",
    time: "10:00 น.",
    location: "Cafe Benne",
    price: "ฟรี",
    tags: ["Fan Event"],
    image: "https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=800&auto=format&fit=crop&q=60",
    description: "มาร่วมฉลองวันเกิดกันต์พิมุกต์ ด้วยโปรเจกต์คาเฟ่สุดน่ารัก รับ Cup Sleeve ฟรีเมื่อซื้อเครื่องดื่ม",
    booking_date: "Walk-in",
    ticket_link: "#",
    start_iso: "20260502T100000",
    end_iso: "20260502T200000",
    announced_iso: "20251001T000000",
    ticket_info: []
  },
  {
    id: 8,
    title: "K-Pop Flea Market",
    type: "Others",
    date: "20 ก.พ. 2569",
    time: "11:00 น.",
    location: "Union Mall",
    price: "ฟรี",
    tags: ["Others"],
    image: "https://images.unsplash.com/photo-1531591022136-eb8b0da1e6d0?w=800&auto=format&fit=crop&q=60",
    description: "ตลาดนัดรวมสินค้า K-Pop ทั้งมือหนึ่งและมือสอง อัลบั้ม การ์ด แท่งไฟ ครบจบในที่เดียว",
    booking_date: "Walk-in",
    ticket_link: "#",
    start_iso: "20260220T110000",
    end_iso: "20260220T200000",
    announced_iso: "20251205T000000",
    ticket_info: []
  }
];

// ==========================================
// 3. MOCK CAFES
// ==========================================
export const SAMPLE_CAFES = [
  {
    id: 1,
    name: "Chill Out Corner",
    description: "คาเฟ่สไตล์มินิมอลสุดฮิตใจกลางสยามที่แฟนคลับ K-Pop ตัวจริงต้องมาเช็คอิน! ร้านตกแต่งด้วยโทนสีขาว-ไม้ ให้ความรู้สึกอบอุ่น สบายตา เหมาะแก่การมานั่งชิลทำงาน หรือเม้าท์มอยกับกลุ่มเพื่อนติ่ง\n\nไฮไลท์ของร้านคือ \"Photo Zone\" ที่เปลี่ยนธีมไปตามวันเกิดศิลปินหรือวันครบรอบเดบิวต์ของวงต่างๆ ทำให้มาทีไรก็ได้รูปไม่ซ้ำ\n\nนอกจากนี้ทางร้านยังมีบริการ \"Cup Sleeve Event\" สำหรับโปรเจกต์วันเกิดศิลปินที่แฟนคลับจัดขึ้น สามารถติดต่อขอใช้สถานที่ได้ฟรี!",
    location: "สยามสแควร์ ซอย 3, กรุงเทพฯ",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60",
    phone: "02-123-4567",
    map_link: "https://maps.google.com",
    opening_hours: "10:00 - 22:00 น.",
    price_range: "100 - 300 บาท/คน",
    special: "รับจัดโปรเจกต์วันเกิดศิลปิน (Cup Sleeve)",
    capacity: "30-50 คน",
    facilities: ["Wi-Fi", "ลำโพง Bluetooth", "จอโปรเจคเตอร์", "พื้นที่ติดป้ายไวนิล (2x1m)"],
    transport: "BTS สยาม ทางออก 2 (เดิน 200 ม.)",
    packages: [
        { name: "โซนส่วนตัว (3 ชม.)", price: "2,500 บาท", details: "ฟรีเครื่องดื่ม 5 แก้ว + เค้ก 2 ชิ้น" },
        { name: "เหมาทั้งร้าน (ครึ่งวัน)", price: "5,000 บาท", details: "ใช้พื้นที่ได้ทั้งหมด 10:00 - 14:00 น." }
    ],
    rules: ["ห้ามนำอาหารภายนอกเข้า (ยกเว้นเค้กวันเกิด)", "อนุญาตให้ติดเทปกาวแบบลอกได้เท่านั้น", "ต้องเก็บของตกแต่งกลับภายในเวลาเช่า"],
    contact_link: "#line-official",
    menu: {
        food: [{ name: "สปาเก็ตตี้คาโบนาร่า", price: "159 บาท" }, { name: "ข้าวยำเกาหลี (Bibimbap)", price: "189 บาท" }],
        dessert: [{ name: "Croffle ราดซอสคาราเมล", price: "129 บาท" }, { name: "Basque Burnt Cheesecake", price: "145 บาท" }],
        drink: [{ name: "Iced Americano (House Blend)", price: "95 บาท" }, { name: "Strawberry Milk Latte", price: "110 บาท" }]
    },
    gallery: [
       "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    id: 2,
    name: "K-Pop Lovers Cafe",
    description: "คาเฟ่สไตล์เกาหลีที่ออกแบบมาเพื่อแฟนเพลง K-Pop โดยเฉพาะ! บรรยากาศสบายๆ พร้อมตกแต่งด้วยโปสเตอร์ศิลปินชื่อดัง\n\nทางร้านมีอุปกรณ์และอัลบั้มแกะแล้วให้ชม สามารถนำอัลบั้มตัวเองมานั่งแกะลุ้นการ์ดได้ พร้อมบริการ Wi-Fi ฟรี",
    location: "123 ถนนสยาม แขวงปทุมวัน กรุงเทพฯ 10330",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=60",
    phone: "081-999-8888",
    map_link: "https://maps.google.com",
    opening_hours: "10:00 - 22:00 น.",
    price_range: "150 - 350 บาท/คน",
    special: "ทุกวันเสาร์ - มีกิจกรรม K-Pop Quiz รับส่วนลด 20%",
    capacity: "20-30 คน",
    facilities: ["Wi-Fi", "ทีวี 50 นิ้ว", "บอร์ดเกม K-Pop"],
    transport: "MRT สามย่าน ทางออก 1 (นั่งวิน 15 บาท)",
    packages: [
        { name: "แจก Cup Sleeve (ฟรี)", price: "ฟรี", details: "เมื่อสั่งขั้นต่ำ 50 แก้วขึ้นไป" }
    ],
    rules: ["ต้องจองล่วงหน้าอย่างน้อย 2 สัปดาห์"],
    menu: {
        food: [{ name: "กระเพราหมูสับ", price: "120 บาท" }, { name: "ข้าวผัดกิมจิ", price: "150 บาท" }, { name: "ทอปปิกกี (ต๊อกบอกกี)", price: "135 บาท" }],
        dessert: [{ name: "บิงซูสตรอเบอร์รี่", price: "180 บาท" }, { name: "มะม่วงบิงซู", price: "200 บาท" }, { name: "Honey Bread", price: "150 บาท" }],
        drink: [{ name: "Butter Latte (BTS Theme)", price: "95 บาท" }, { name: "Pink Venom Bubble Tea", price: "85 บาท" }]
    }
  },
  {
    id: 3,
    name: "Stan Cafe Bangkok",
    description: "แหล่งรวมแฟนคลับทุกวง มีกิจกรรมเล่น MV และจำหน่ายสินค้า",
    location: "อารีย์, กรุงเทพฯ",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=60",
    phone: "02-555-6666",
    map_link: "#",
    capacity: "40 คน",
    facilities: ["จอ LED ใหญ่", "เครื่องเสียง"],
    transport: "BTS อารีย์",
    gallery: [
       "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    id: 4,
    name: "Idol Dream Cafe",
    description: "คาเฟ่ธีมไอดอลเกาหลี มีห้องคาราโอเกะส่วนตัว",
    location: "เอกมัย, กรุงเทพฯ",
    image: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&auto=format&fit=crop&q=60",
    phone: "02-777-8888",
    map_link: "#",
    capacity: "60 คน",
    facilities: ["Karaoke", "Private Room"],
    transport: "BTS เอกมัย",
    gallery: [
       "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=60",
       "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=60"
    ]
  }
];