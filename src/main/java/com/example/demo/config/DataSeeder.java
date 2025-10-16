package com.example.demo.config;

import com.example.demo.model.Category;
import com.example.demo.model.Place;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        loadInitialData();
    }

    private void loadInitialData() {
    		
    	if (categoryRepository.count() > 0 && placeRepository.count() > 0) {
            System.out.println("⚠️ ข้ามการ seed เพราะมีข้อมูลอยู่แล้ว");
            return;
        }

        System.out.println("Loading ALL places from PDF files into the database...");

        // --- 1. สร้างและบันทึก Categories ---
        Category food = categoryRepository.save(new Category(null, "อาหารและเครื่องดื่ม"));
        Category cafe = categoryRepository.save(new Category(null, "คาเฟ่และเบเกอรี่"));
        Category academic = categoryRepository.save(new Category(null, "คณะและอาคารเรียน"));
        Category sport = categoryRepository.save(new Category(null, "กีฬาและสันทนาการ"));
        Category service = categoryRepository.save(new Category(null, "บริการและร้านค้า"));
        Category health = categoryRepository.save(new Category(null, "โรงพยาบาลและคลินิก"));
        Category dorm = categoryRepository.save(new Category(null, "หอพัก"));
        Category transport = categoryRepository.save(new Category(null, "การเดินทางและที่จอดรถ"));
        Category landmark = categoryRepository.save(new Category(null, "สถานที่สำคัญและอื่นๆ"));

        // --- 2. สร้าง List ของสถานที่ทั้งหมด ---
        List<Place> places = List.of(
            // --- Location1 ---
            new Place(null, "สนามกีฬามหาวิทยาลัยธรรมศาสตร์", "สนามกีฬา", "06:00", "20:00", "สนามกีฬา", 14.0729, 100.6128, "https://www.khaosod.co.th/wp-content/uploads/2020/07/S__10123547.jpg", sport),
            new Place(null, "โรงพยาบาลธรรมศาสตร์เฉลิมพระเกียรติ", "โรงพยาบาลมหาวิทยาลัย", "00:00", "23:59", "โรงพยาบาล", 14.0760, 100.6155, "https://sgs.tu.ac.th/wp-content/uploads/2021/08/210803-TUH-Field-Hospital-8.jpg", health),
            new Place(null, "ศูนย์อาหารกรีนแคนทีน by ซีพี ฟู้ดเวิล์ด", "โรงอาหารกลาง", "08:00", "17:30", "โรงอาหาร", 14.0708, 100.6050, "https://f.ptcdn.info/628/064/000/ptq2eh2z0sW644vQ0Lz-o.jpg", food),
            new Place(null, "ยิมเนเซียม 4 ธรรมศาสตร์", "สนามกีฬา", "09:00", "21:00", "ยิมเนเซียม", 14.0694, 100.6138, "https://thinkofliving.com/wp-content/uploads/2014/11/%E0%B8%A2%E0%B8%B4%E0%B8%A1-4.jpg", sport),
            new Place(null, "ตลาดนัดอินเตอร์โซน", "ตลาดนัด", "16:00", "22:00", "ตลาดนัด", 14.0673, 100.6154, "https://i.ytimg.com/vi/1_z322GfIUU/maxresdefault.jpg", food),
            new Place(null, "ดีคอนโด ธรรมศาสตร์", "โรงแรม", "N/A", "N/A", "คอนโด", 14.0650, 100.6110, "https://img.wongnai.com/p/1920x0/2018/01/24/0e8f3e223c7f4b8f9e9a4f8f8b8e3e3e.jpg", dorm),
            new Place(null, "ศูนย์สอบธรรมศาสตร์", "มหาวิทยาลัย", "08:00", "17:00", "ศูนย์สอบ", 14.0699, 100.6133, "https://s3.ap-southeast-1.amazonaws.com/asset.tu.ac.th/image/community/37/post/2020/10/22/41417/main_image/tcaster-tu-rangsit-08.jpg", academic),
            new Place(null, "สตาร์บัคส์ (SC)", "ร้านกาแฟ", "07:00", "19:30", "กาแฟ", 14.0710, 100.6047, "https://www.ryoiireview.com/upload/article/202108/1629864203_e583d72a91217036a10052b6113b288e.jpg", cafe),
            new Place(null, "โรงอาหารสังคมศาสตร์ 1", "โรงอาหาร", "07:00", "18:00", "โรงอาหาร", 14.0710, 100.6047, "https://img.wongnai.com/p/1920x0/2018/09/20/0c897f1e6f4a4d6e9f5e9a4d8c9a3e3c.jpg", food),
            new Place(null, "Yakishi Yakiniku", "บุฟเฟต์", "11:00", "21:00", "ปิ้งย่าง", 14.0687, 100.6056, "https://img.wongnai.com/p/1920x0/2021/11/05/982f6412b5b348d28701cd99127815de.jpg", food),
            new Place(null, "อุทยานการเรียนรู้ป๋วย 100 ปี", "สวนสาธารณะ", "00:00", "23:59", "สวนสาธารณะ", 14.0738, 100.6041, "https://hilight.kapook.com/img_hilight/2020/12_2.jpg", sport),
            new Place(null, "S.O.L.A.R Café", "ร้านกาแฟ", "08:00", "17:30", "กาแฟ", 14.0738, 100.6042, "https://img.wongnai.com/p/1920x0/2021/04/01/a4639e44654b4194a08e6027c6f0920d.jpg", cafe),
            new Place(null, "Hotto Bun ธรรมศาสตร์", "ร้านอาหาร", "10:00", "21:00", "อาหารญี่ปุ่น", 14.0700, 100.6062, "https://img.wongnai.com/p/1920x0/2020/01/10/a1b2c3d4e5f64a7b8c9d0e1f2a3b4c5d.jpg", food),
            new Place(null, "ศูนย์หนังสือมหาวิทยาลัยธรรมศาสตร์", "ร้านหนังสือ", "08:30", "17:30", "ร้านหนังสือ", 14.0704, 100.6060, "https://s359.kapook.com/pagebuilder/e760b2d0-659e-434a-9531-189650e69888.jpg", service),
            new Place(null, "สตาร์บัคส์ (โรงพยาบาลธรรมศาสตร์)", "ร้านกาแฟ", "07:00", "19:00", "กาแฟ", 14.0768, 100.6152, "https://www.topuniversities.com/sites/default/files/styles/articles_inline/public/articles/lead-images/1_starbucks_on_campus.jpg.webp", cafe),
            new Place(null, "COF AND COW at Thammasat Rangsit", "ร้านกาแฟ Specialty", "08:00", "18:00", "กาแฟ", 14.0727, 100.6063, "https://img.wongnai.com/p/1920x0/2022/02/08/9a37c89f5c4441dd8950f28e28f32f41.jpg", cafe),
            new Place(null, "ยิมเนเซียม 5 ธรรมศาสตร์", "สนามกีฬา", "09:00", "21:00", "ยิมเนเซียม", 14.0689, 100.6144, "https://www.matichon.co.th/wp-content/uploads/2018/01/%E0%B8%A2%E0%B8%B4%E0%B8%A1%E0%B9€5-%E0%B8%A1%E0%B8%98.1.jpg", sport),
            new Place(null, "SteakHolder", "สเต็ก", "11:00", "20:30", "สเต็ก", 14.0687, 100.6056, "https://img.wongnai.com/p/1920x0/2021/08/04/4f2c069b139c4a86a7d519b5c5e8d9b1.jpg", food),
            new Place(null, "สระว่ายน้ำ มหาวิทยาลัยธรรมศาสตร์ รังสิต", "สระว่ายน้ำในร่ม", "09:00", "21:00", "สระว่ายน้ำ", 14.0745, 100.6121, "https://www.arch.tu.ac.th/media-news/item/957-aquatic-center/957-aquatic-center.jpg", sport),
            new Place(null, "ปตท.ธรรมศาสตร์ รังสิต (น้ำมัน+EV)", "สถานีบริการน้ำมัน", "06:00", "22:00", "ปั๊มน้ำมัน", 14.0733, 100.6091, "https://www.bkkmenu.com/files/2020/07/inthanin-2.jpg", transport),
            new Place(null, "สนามมินิสเตเดียม มหาวิทยาลัยธรรมศาสตร์", "สนามกีฬา", "06:00", "21:00", "สนามกีฬา", 14.0743, 100.6133, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", sport),
            new Place(null, "สถานีขนส่ง (ท่ารถตู้) มธ.ศูนย์รังสิต", "บริการการขนส่ง", "06:00", "22:00", "ท่ารถตู้", 14.0726, 100.6063, "https://www.prachachat.net/wp-content/uploads/2018/10/TU-shutter-bus-728x485.jpg", transport),
            new Place(null, "โรงอาหารสังคมศาสตร์ 2 (SC2)", "โรงอาหาร", "07:30", "16:30", "โรงอาหาร", 14.0712, 100.6045, "https://img.wongnai.com/p/1920x0/2019/02/21/5d3f8e5b4b7c4d5b9b3e8e9e7e8e9e9e.jpg", food),
            new Place(null, "สถาบันเทคโนโลยีนานาชาติสิรินธร มหาวิทยาลัยธรรมศาสตร์ - ศูนย์รังสิต", "ฝ่ายวิชาการ", "08:30", "16:30", "คณะ", 14.0686, 100.6103, "https://siit.tu.ac.th/about_siit_upload/about_siit_20200810141936.jpg", academic),
            new Place(null, "ร้านยำยูป้า ม.ธรรมศาสตร์ รังสิต", "ร้านอาหาร", "07:30", "20:00", "ยำ", 14.0703, 100.6053, "https://img.wongnai.com/p/1920x0/2022/10/05/982f6412b5b348d28701cd99127815de.jpg", food),
            new Place(null, "ศูนย์กีฬาทางน้ำ มหาวิทยาลัยธรรมศาสตร์", "ศูนย์กีฬาทางน้ำ", "09:00", "21:00", "ศูนย์กีฬา", 14.0745, 100.6120, "https://www.arch.tu.ac.th/media-news/item/957-aquatic-center/957-aquatic-center.jpg", sport),
            new Place(null, "The kitchen and The coffee station", "ร้านอาหาร", "N/A", "N/A", "อาหาร", 14.0708, 100.6050, "https://img.wongnai.com/p/1920x0/2019/11/15/d4f4b2e8e3d64c9f8d8a7c1b1c1b1c1b.jpg", food),
            new Place(null, "ห้องประชุม สถาพร กวิตานนท์", "สถานที่จัดงาน", "N/A", "N/A", "ห้องประชุม", 14.0718, 100.6142, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "ญาดา นวดแผนไทยเพื่อสุขภาพ", "นักนวดแผนไทย", "10:00", "20:00", "นวด", 14.0766, 100.6152, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", health),
            new Place(null, "S&P ม.ธรรมศาสตร์รังสิต", "ร้านอาหาร", "07:00", "17:00", "อาหาร", 14.0743, 100.6125, "https://tatapi.tourismthailand.org/tatfs/Image/CustomPOI/d26214cf-4828-4835-a76c-3105df4f85e4.jpg", food),
            new Place(null, "โปเต้ ก๊อปปี้", "ร้านงานพิมพ์", "09:00", "20:00", "ถ่ายเอกสาร", 14.0681, 100.6032, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", service),
            new Place(null, "คณะแพทยศาสตร์ มหาวิทยาลัยธรรมศาสตร์", "โรงเรียนการแพทย์", "08:30", "16:30", "คณะ", 14.0754, 100.6122, "https://med.tu.ac.th/uploads/med/content/2022/07/19/22_content_thumb.jpg", academic),
            new Place(null, "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต", "โรงเรียนวิศวกรรม", "08:00", "17:00", "คณะ", 14.0686, 100.6017, "https://engr.tu.ac.th/uploads/images/%E0%B8%AD%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A3/DSCF4966.JPG", academic),
            new Place(null, "หอสมุดป๋วย อึ๊งภากรณ์", "ห้องสมุดมหาวิทยาลัย", "08:00", "21:00", "ห้องสมุด", 14.0733, 100.6016, "https://invest.tu.ac.th/wp-content/uploads/2021/07/puey.jpg", academic),
            new Place(null, "TUH parking & plaza", "ศูนย์การค้า", "N/A", "21:00", "พลาซ่า", 14.0770, 100.6175, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", service),
            new Place(null, "ลานพญานาค ธรรมศาสตร์", "อุทยาน", "00:00", "23:59", "ลานกิจกรรม", 14.0712, 100.6041, "https://pbs.twimg.com/media/Cj1l3S-VAAEZxGg.jpg", landmark),
            new Place(null, "สนามฟุตบอล Flick TU", "สนามฟุตบอล", "08:00", "00:00", "สนามฟุตบอล", 14.0730, 100.6136, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", sport),
            new Place(null, "พิซซ่าฮัท สาขาทียู ปาร์ค พลาซ่า", "พิซซ่า", "10:00", "20:00", "พิซซ่า", 14.0772, 100.6176, "https://www.pizzahut.co.th/images/about/about-img-2.jpg", food),
            new Place(null, "อาคารเรียนรวมสังคมศาสตร์", "ฝ่ายวิชาการ", "08:00", "20:00", "อาคารเรียน", 14.0710, 100.6046, "https://pbs.twimg.com/media/DAXJzJgUIAEWp22.jpg", academic),
            new Place(null, "UStore ธรรมศาสตร์รังสิต (ยิมเนเซียม 7)", "ร้านอุปกรณ์อิเล็กทรอนิกส์", "10:00", "18:00", "ร้านไอที", 14.0693, 100.6128, "https://s3.ap-southeast-1.amazonaws.com/asset.tu.ac.th/image/community/37/post/2021/04/18/49172/main_image/ustore-tu-01.jpg", service),
            new Place(null, "KAMU TEA คามุสาขาธรรมศาสตร์ รังสิต", "ร้านกาแฟ", "10:00", "21:00", "ชานม", 14.0727, 100.6051, "https://kamukamu.co.th/wp-content/uploads/2020/04/kamu-tea-scaled.jpg", cafe),
            new Place(null, "Café Amazon สาขา อาคารศูนย์การเรียนรู้", "ร้านกาแฟ", "07:00", "18:00", "กาแฟ", 14.0715, 100.6045, "https://fastly.4sqi.net/img/general/600x600/40961819_RsvM-p2sJvGk_WwzH5v88PTfB0-kQW5yY8gN0gC_g1g.jpg", cafe),
            new Place(null, "คณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต", "คณะนิติศาสตร์", "00:00", "23:59", "คณะ", 14.0736, 100.6002, "https://www.law.tu.ac.th/wp-content/uploads/2022/10/S__7092131.jpg", academic),
            new Place(null, "โรงอาหารคณะวิทยาศาสตร์", "ศูนย์อาหาร", "07:00", "17:00", "โรงอาหาร", 14.0673, 100.6046, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", food),
            new Place(null, "ท่ารถตู้ ธรรมศาสตร์ รังสิต - อนุสาวรีย์ชัยสมรภูมิ", "บริการการขนส่ง", "06:00", "21:30", "ท่ารถตู้", 14.0726, 100.6063, "https://www.prachachat.net/wp-content/uploads/2018/10/TU-shutter-bus-728x485.jpg", transport),
            new Place(null, "คลินิกแพทย์แผนไทยประยุกต์", "คลินิกการแพทย์", "08:30", "16:30", "คลินิก", 14.0754, 100.6124, "https://www.alliedtu.com/wp-content/uploads/2019/08/tu-ttm-clinic-3.jpg", health),
            new Place(null, "ท็อปส์ เดลี่ สาขาหอพัก มธ.รังสิต", "ร้านสะดวกซื้อ", "06:00", "22:00", "ร้านสะดวกซื้อ", 14.0667, 100.6166, "https://pbs.twimg.com/media/EtE5_GjVgAAq_B6.jpg", service),
            new Place(null, "T Teddy car wash", "บริการล้างรถ", "09:00", "18:00", "ล้างรถ", 14.0738, 100.6039, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", service),
            new Place(null, "Potato Corner Thammasat Rangsit", "อาหารจานด่วน", "10:00", "20:00", "ของทานเล่น", 14.0732, 100.6014, "https://today.line.me/th/v2/publisher/100924/200x200", food),
            new Place(null, "Black Canyon", "ร้านกาแฟ", "08:00", "18:30", "กาแฟ", 14.0768, 100.6151, "https://www.brandbuffet.in.th/wp-content/uploads/2018/10/Black-Canyon.jpg", cafe),
            new Place(null, "ยิมเนเซียม 7 ธรรมศาสตร์", "สนามกีฬา", "09:00", "21:00", "ยิมเนเซียม", 14.0693, 100.6129, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", sport),
            new Place(null, "หอพักแพทย์ มหาวิทยาลัยธรรมศาสตร์", "หอพัก", "00:00", "23:59", "หอพัก", 14.0766, 100.6116, "https://med.tu.ac.th/th/wp-content/uploads/2020/09/dorm-1-1024x683.jpg", dorm),
            new Place(null, "พิพิธภัณฑ์ธรรมศาสตร์เฉลิมพระเกียรติ", "พิพิธภัณฑ์", "09:00", "16:00", "พิพิธภัณฑ์", 14.0725, 100.6025, "https://www.museumthailand.com/upload/cover/1545620853_818.jpg", academic),
            new Place(null, "Inthanin Coffee", "ร้านกาแฟ", "08:00", "17:00", "กาแฟ", 14.0686, 100.6015, "https://www.bkkmenu.com/files/2020/07/inthanin-2.jpg", cafe),
            new Place(null, "คณะสถาปัตยกรรมศาสตร์และการผังเมือง", "โรงเรียนสถาปัตยกรรม", "08:00", "17:00", "คณะ", 14.0681, 100.6029, "https://www.arch.tu.ac.th/wp-content/uploads/2023/04/%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%9B%E0%B8%81-TUP-ENG-2-1024x683.jpg", academic),
            new Place(null, "ทียู ฟิตเนส TUFitness", "สถานออกกำลังกาย", "09:00", "21:00", "ฟิตเนส", 14.0748, 100.6123, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", sport),
            new Place(null, "สนามเทนนิส ธรรมศาสตร์", "สนามเทนนิส", "06:00", "21:00", "สนามเทนนิส", 14.0735, 100.6140, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", sport),
            new Place(null, "อาคารเรียนรวมสังคมศาสตร์ 3 (SC3)", "มหาวิทยาลัย", "08:00", "16:30", "อาคารเรียน", 14.0714, 100.6042, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "สำนักงานบริหารทรัพย์สินและกีฬา", "สำนักงานของบริษัท", "08:30", "17:30", "สำนักงาน", 14.0729, 100.6110, "https://asset.tu.ac.th/uploads/asset/content/2021/09/23/9_content_thumb.jpg", service),
            new Place(null, "คณะวิทยาการเรียนรู้และศึกษาศาสตร์", "มหาวิทยาลัยรัฐ", "08:30", "16:30", "คณะ", 14.0730, 100.6023, "https://s3.ap-southeast-1.amazonaws.com/asset.tu.ac.th/image/community/37/post/2021/11/02/57532/main_image/lsed-tu-open-house-2022-tcas65.jpg", academic),
            new Place(null, "ธนาคารกรุงไทย สาขามหาวิทยาลัยธรรมศาสตร์", "ธนาคาร", "08:30", "16:30", "ธนาคาร", 14.0731, 100.6018, "https://fastly.4sqi.net/img/general/600x600/49089966_2u-18M7hK3p24_y1hB7-7Q7U7l1t2I_Z_0tA7eA.jpg", service),
            new Place(null, "อาคารบรรยายรวม 1 (บร.1)", "มหาวิทยาลัย", "08:00", "20:00", "อาคารเรียน", 14.0678, 100.6074, "https://f.ptcdn.info/169/077/000/rd38p4d55t3O03V1N9S1p-o.jpg", academic),
            new Place(null, "หอพระพุทธธรรมทิฐิศาสดา", "เทวสถาน", "00:00", "23:59", "หอพระ", 14.0734, 100.6014, "https://s3.ap-southeast-1.amazonaws.com/asset.tu.ac.th/image/community/37/album/2022/01/24/769/61ee344754751.jpg", landmark),
            new Place(null, "เคเอฟซี สาขาโรงพยาบาลธรรมศาสตร์", "อาหารจานด่วน", "09:00", "20:00", "ไก่ทอด", 14.0763, 100.6151, "https://images.deliveryhero.io/image/fd-th/LH/v6lv-hero.jpg", food),
            new Place(null, "สถาบันเอเชียตะวันออกศึกษา", "ฝ่ายวิชาการ", "08:30", "16:30", "สถาบัน", 14.0719, 100.6023, "https://ias.tu.ac.th/wp-content/uploads/2020/09/cropped-ias-logo.png", academic),
            new Place(null, "ศูนย์การเรียนรู้กรมหลวงนราธิวาสราชนครินทร์", "ศูนย์การเรียนรู้", "07:00", "22:00", "ศูนย์การเรียนรู้", 14.0715, 100.6045, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "D'ORO โรงพยาบาลธรรมศาสตร์", "ร้านกาแฟ", "06:30", "17:00", "กาแฟ", 14.0768, 100.6151, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", cafe),
            new Place(null, "โรงพิมพ์มหาวิทยาลัยธรรมศาสตร์", "ร้านงานพิมพ์", "08:30", "16:30", "โรงพิมพ์", 14.0700, 100.6100, "https://tupress.tu.ac.th/wp-content/uploads/2020/09/cropped-logo-tupress.png", service),
            new Place(null, "ตลาดนัดโรงพยาบาลธรรมศาสตร์", "ตลาด", "08:00", "18:00", "ตลาดนัด", 14.0770, 100.6150, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", food),
            new Place(null, "คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยธรรมศาสตร์", "คณะวิทยาศาสตร์", "08:00", "17:00", "คณะ", 14.0673, 100.6045, "https://asset.tu.ac.th/image/community/37/post/2023/04/18/72661/main_image/sci-tu-openhouse-2023.jpg", academic),
            new Place(null, "เจียง ลูกชิ้นปลา", "ร้านก๋วยเตี๋ยว", "08:00", "20:00", "ก๋วยเตี๋ยว", 14.0772, 100.6174, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", food),
            new Place(null, "วัน ออน วัน ฟิตเนส", "สถานออกกำลังกาย", "09:00", "22:00", "ฟิตเนส", 14.0689, 100.6144, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", sport),
            new Place(null, "ทันตกรรม รพ.ธรรมศาสตร์", "โรงพยาบาล", "08:30", "16:30", "ทันตกรรม", 14.0759, 100.6152, "https://www.tdentu.com/wp-content/uploads/2022/10/DSC01476-scaled.jpg", health),
             
            // --- Location2 ---
            new Place(null, "Virta Charging Station", "สถานีชาร์จไฟฟ้า", "00:00", "23:59", "EV Charger", 14.0734, 100.6090, "https://www.virta.global/hs-fs/hubfs/Virta%20Brand%202021/virta-logo-blue-transparent.png?width=1000&name=virta-logo-blue-transparent.png", transport),
            new Place(null, "ห้องสมุดนงเยาว์ ชัยเสรี", "ห้องสมุดมหาวิทยาลัย", "08:30", "20:00", "ห้องสมุด", 14.0758, 100.6125, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "B&P Crepes", "อาหารจานด่วน", "08:00", "20:00", "เครป", 14.0705, 100.6055, "https://img.wongnai.com/p/1920x0/2018/10/05/c672bbf6132142f8836402fc6e7552aa.jpg", food),
            new Place(null, "ประตูเชียงราก 2 (Chiang Rak 2 Gate)", "สถาบันการศึกษา", "05:00", "22:00", "ประตู", 14.0729, 100.6056, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", landmark),
            new Place(null, "ลานจอดรถ อาคาร บร.5", "ที่จอดรถ", "00:00", "23:59", "ที่จอดรถ", 14.0671, 100.6048, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", transport),
            new Place(null, "Thammasat Dormitory M2", "หอพัก", "00:00", "23:59", "หอพัก", 14.0660, 100.6139, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", dorm),
            new Place(null, "ป้ายรถประจำทาง ปอ.510", "บริการการขนส่ง", "05:00", "22:00", "ป้ายรถเมล์", 14.0684, 100.6018, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", transport),
            new Place(null, "กองพัฒนาคุณภาพ มหาวิทยาลัยธรรมศาสตร์", "มหาวิทยาลัยรัฐ", "08:30", "16:30", "สำนักงาน", 14.0718, 100.6025, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", service),
            new Place(null, "ร้าน 3 พี ขนมจีบ หมูปิ้ง", "ร้านอาหาร", "06:00", "18:00", "สตรีทฟู้ด", 14.0712, 100.6058, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", food),
            new Place(null, "สถานี Biky - เชียงราก 2", "สถานีแชร์จักรยาน", "N/A", "N/A", "จักรยาน", 14.0728, 100.6057, "https://www.ofm.co.th/blog/wp-content/uploads/2018/09/Anywheel-Bike-Sharing.jpg", transport),
            new Place(null, "Bonjour", "ร้านของหวาน", "08:00", "20:00", "เบเกอรี่", 14.0775, 100.6170, "https://img.wongnai.com/p/1920x0/2020/01/29/7747805988d844249a43a29b4703a891.jpg", cafe),
            new Place(null, "เจ๊เป้า ชวนชิม", "ร้านอาหาร", "08:00", "19:00", "อาหารตามสั่ง", 14.0675, 100.6048, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", food),
            new Place(null, "หอพักเอเชียนเกมส์ บี 3", "กลุ่มอาคารอพาร์ตเมนต์", "00:00", "23:59", "หอพัก", 14.0683, 100.6186, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", dorm),
            new Place(null, "Thammasat Radio Station", "สถานีวิทยุกระจายเสียง", "09:00", "17:00", "สถานีวิทยุ", 14.0723, 100.6033, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", service),
            new Place(null, "Skateboard park", "อุทยาน", "00:00", "23:59", "ลานสเก็ต", 14.0691, 100.6135, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", sport),
            new Place(null, "ATM ธนาคารกรุงไทย", "ตู้เอทีเอ็ม", "00:00", "23:59", "ATM", 14.0704, 100.6061, "https://www.ktb.co.th/getattachment/5f5e263c-3932-4144-8898-171576f3f009/KTB-New-Logo.svg", service),
            new Place(null, "สำนักงานห้องปฏิบัติการภาควิชาวิศวกรรมโยธา", "มหาวิทยาลัย", "08:30", "16:30", "ห้องปฏิบัติการ", 14.0686, 100.6017, "https://engr.tu.ac.th/uploads/images/%E0%B8%AD%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A3/DSCF4966.JPG", academic),
            new Place(null, "อิสานตำแหลก", "สลัด", "10:00", "20:00", "ส้มตำ", 14.0689, 100.6054, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", food),
            new Place(null, "ร้านอาหารอิสลามซากีนะ ข้าวยำไก่แซ่บ", "ร้านอาหาร", "N/A", "N/A", "อาหารฮาลาล", 14.0673, 100.6154, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", food),
            new Place(null, "สมาคมยิงปืนธรรมศาสตร์", "สปอร์ตคลับ", "17:00", "20:00", "สนามยิงปืน", 14.0765, 100.6105, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", sport),
            new Place(null, "คณะทันตแพทยศาสตร์ มหาวิทยาลัยธรรมศาสตร์", "โรงเรียนทันตกรรม", "08:00", "17:00", "คณะ", 14.0747, 100.6095, "https://www.tdentu.com/wp-content/uploads/2022/10/DSC01476-scaled.jpg", academic),
            new Place(null, "สถานี Biky - เชียงราก 1", "สถานีแชร์จักรยาน", "N/A", "N/A", "จักรยาน", 14.0684, 100.6000, "https://www.ofm.co.th/blog/wp-content/uploads/2018/09/Anywheel-Bike-Sharing.jpg", transport),
            new Place(null, "TU BOOKSTORE", "ร้านหนังสือ", "08:00", "18:00", "ร้านหนังสือ", 14.0704, 100.6060, "https://s359.kapook.com/pagebuilder/e760b2d0-659e-434a-9531-189650e69888.jpg", service),
            new Place(null, "Bangkok Bank ATM", "ตู้เอทีเอ็ม", "00:00", "23:59", "ATM", 14.0720, 100.6028, "https://www.bangkokbank.com/-/media/project/bbl/bbl-web/site/home/logo/bbl-logo-new.svg", service),
            new Place(null, "ร้านกาแฟ บร.2", "ร้านกาแฟ", "N/A", "N/A", "กาแฟ", 14.0708, 100.6030, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", cafe),
            new Place(null, "ME Lab", "ห้องทดลองในมหาวิทยาลัย", "N/A", "N/A", "ห้องปฏิบัติการ", 14.0686, 100.6017, "https://engr.tu.ac.th/uploads/images/%E0%B8%AD%E0%B8%B2%E0%B8%84%E0%B8%B2%E0%B8%A3/DSCF4966.JPG", academic),
            new Place(null, "ห้องเรียนวิทยาศาสตร์ของโครงการ วมว.", "สถาบันการศึกษา", "N/A", "N/A", "ห้องเรียน", 14.0672, 100.6046, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "สนามฟุตบอลโดม", "สนามฟุตบอล", "N/A", "N/A", "สนามฟุตบอล", 14.0718, 100.6025, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", sport),
            new Place(null, "โรงละคอนคณะศิลปกรรมศาสตร์", "โรงเรียนการแสดง", "N/A", "N/A", "โรงละคร", 14.0715, 100.6011, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "ภาควิชาทันตกรรมจัดฟัน คณะทันตแพทยศาสตร์", "ฝ่ายวิชาการ", "09:00", "16:30", "ภาควิชา", 14.0747, 100.6095, "https://www.tdentu.com/wp-content/uploads/2022/10/DSC01476-scaled.jpg", academic),
            new Place(null, "คณะสาธารณสุขศาสตร์ มหาวิทยาลัยธรรมศาสตร์", "ฝ่ายวิชาการ", "08:30", "16:30", "คณะ", 14.0734, 100.6093, "https://fph.tu.ac.th/storage/albums/October2021/Jq7tM280v5x7P7G6wG3l.jpg", academic),
            new Place(null, "อาคารเดือน บุนนาค", "สถาบันการศึกษา", "N/A", "N/A", "อาคารเรียน", 14.0718, 100.6030, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "สนามซอฟท์บอล มหาวิทยาลัยธรรมศาสตร์", "สนามซอฟต์บอล", "N/A", "N/A", "สนามกีฬา", 14.0726, 100.6100, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", sport),
            new Place(null, "อนุสาวรีย์ปรีดีและป๋วย", "สวนอนุสรณ์สถาน", "00:00", "23:59", "อนุสาวรีย์", 14.0735, 100.6042, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", landmark),
            new Place(null, "คลินิกการแพทย์ผสมผสาน วิทยาลัยแพทยศาสตร์นานาชาติจุฬาภรณ์", "คลินิกฝังเข็ม", "08:30", "16:30", "คลินิก", 14.0752, 100.6136, "https://www.cicm.tu.ac.th/images/ac-clinic/ac-1.jpg", health),
            new Place(null, "ATM ธนาคารกรุงไทย (U-House)", "ตู้เอทีเอ็ม", "00:00", "23:59", "ATM", 14.0673, 100.6074, "https://www.ktb.co.th/getattachment/5f5e263c-3932-4144-8898-171576f3f009/KTB-New-Logo.svg", service),
            new Place(null, "Piyachart 2 Building", "ศูนย์การเรียนรู้", "N/A", "N/A", "อาคารเรียน", 14.0752, 100.6136, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "โรงอาหาร SC1 (Monkey Share)", "ร้านกาแฟ", "07:00", "19:00", "ร้านกาแฟ", 14.0710, 100.6047, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", cafe),
            new Place(null, "วิทันตสาสมาธิ สาขา 177 คณะแพทย์ศาสตร์", "สถาบันการศึกษา", "16:30", "18:30", "สมาธิ", 14.0754, 100.6122, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "กองทรัพยากรมนุษย์ มหาวิทยาลัยธรรมศาสตร์", "มหาวิทยาลัยรัฐ", "08:30", "16:30", "สำนักงาน", 14.0718, 100.6025, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", service),
            new Place(null, "ร้านนายโอ๋เตี๋ยวต้มยำไข่&Coffee", "ร้านอาหาร", "N/A", "N/A", "ก๋วยเตี๋ยว", 14.0726, 100.6063, "https://img.wongnai.com/p/1920x0/2021/08/13/a114f4208a0d4c829e088d8b2a3f5f3e.jpg", food),
            new Place(null, "Learning Center 5, Thammasat Rangsit Campus", "ศูนย์การเรียนรู้", "06:00", "22:00", "อาคารเรียน", 14.0672, 100.6046, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "เทรนเนอร์ มธ รังสิต", "ผู้ฝึกสอนส่วนตัว", "00:00", "23:59", "ฟิตเนส", 14.0748, 100.6123, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", sport),
            new Place(null, "Medicinal Herb Lab Services", "ห้องปฏิบัติการ", "08:30", "16:30", "ห้องปฏิบัติการ", 14.0734, 100.6093, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "เรือนไทยคดีศึกษา", "สถาบันวิจัย", "N/A", "N/A", "เรือนไทย", 14.0786, 100.6098, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "โรงเรียนสาธิตแห่งมหาวิทยาลัยธรรมศาสตร์ (อาคาร D)", "โรงเรียนมัธยมศึกษา", "08:00", "16:00", "โรงเรียน", 14.0799, 100.6198, "https://www.satit.tu.ac.th/wp-content/uploads/2022/06/DSC_9706-1-1024x683.jpg", academic),
            new Place(null, "Tha Prachan Commuter Bus Stop", "ป้ายรถเมล์", "N/A", "N/A", "รถโดยสาร", 14.0726, 100.6063, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", transport),
            new Place(null, "สถาบันพลังจิตตานุภาพ 177 มหาลัยธรรมศาสตร์", "สถาบันการศึกษา", "N/A", "N/A", "สมาธิ", 14.0672, 100.6046, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "CRC TU", "สถาบันวิจัย", "N/A", "N/A", "สถาบันวิจัย", 14.0759, 100.6155, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", academic),
            new Place(null, "ATM ธนาคารกสิกรไทย", "ตู้เอทีเอ็ม", "00:00", "23:59", "ATM", 14.0704, 100.6061, "https://www.kasikornbank.com/SiteCollectionDocuments/about/im-en/im-en-logo-01.svg", service),
            new Place(null, "ศูนย์ความเป็นเลิศเท้าเบาหวาน", "คลินิกการแพทย์", "N/A", "N/A", "คลินิก", 14.0770, 100.6150, "https://fastly.4sqi.net/img/general/600x600/5129188_3d_y5a5a_q5o5b5e5c_u5e5d_5r5g5.jpg", health)
        );
        
        // --- 3. บันทึกข้อมูลสถานที่ทั้งหมด ---
        placeRepository.saveAll(places);
        System.out.println("✅ Saved places count: " + placeRepository.count());
        System.out.println("✅ Categories count: " + categoryRepository.count());
       

        System.out.println(categoryRepository.count() + " categories and " + placeRepository.count() + " places have been loaded.");
       
    }
    public void seedAllData() {
            try {
                loadInitialData();
                System.out.println("✅ DataSeeder: seedAllData() เรียกใช้งานสำเร็จ!");
            } catch (Exception e) {
                System.err.println("❌ DataSeeder: เกิดข้อผิดพลาดระหว่าง seeding → " + e.getMessage());
                e.printStackTrace();
            }
        } // <-- ปิด seedAllData()

        } // <-- ปิด class DataSeeder