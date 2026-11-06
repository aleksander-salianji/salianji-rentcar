package com.salianji.rentcar.config;

import com.salianji.rentcar.model.BlogPost;
import com.salianji.rentcar.repository.BlogPostRepository;
import com.salianji.rentcar.service.BlogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

// Tre artikuj fillestarë, vetëm kur blogu është bosh. Ndryshoji ose fshiji nga Paneli → Blogu.
@Component
@Order(3)
public class BlogSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(BlogSeeder.class);

    private final BlogPostRepository repository;

    public BlogSeeder(BlogPostRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        Instant now = Instant.now();
        List<BlogPost> posts = List.of(
            post("Rruga e Rivierës: 5 ndalesa nga Vlora në Sarandë",
                "Udhëtime",
                "Një nga rrugët më të bukura të Ballkanit. Ja ku të ndalesh, sa zgjat dhe çfarë makine të marrësh.",
                "https://commons.wikimedia.org/wiki/Special:FilePath/2022_MY_Toyota_RAV4_Hybrid_facelift_XA50.jpg?width=1280",
                """
                Rruga nga Vlora në Sarandë kalon Qafën e Llogarasë dhe zbret drejt detit Jon. Janë rreth 125 km, por planifiko një ditë të plotë: do të ndalesh shpesh.

                ## 1. Qafa e Llogarasë
                Në 1027 metra lartësi, pamja mbi Rivierë është e paharrueshme. Ndalo te pikat e shikimit para se të fillosh zbritjen.

                ## 2. Dhërmiu
                Plazhe me ujë të kristaltë dhe fshati i vjetër mbi kodër. Ideal për drekë.

                ## 3. Himara
                Kalaja e vjetër dhe plazhi i Livadhit. Mirë për të fjetur një natë.

                ## 4. Porto Palermo
                Kalaja e Ali Pashë Tepelenës në një gji të qetë. Ndalesë e shkurtër, por ia vlen.

                ## 5. Saranda
                Fundi i udhëtimit, me Butrintin dhe Syrin e Kaltër afër.

                ## Çfarë makine të marrësh?
                - SUV ose sedan me motor të fortë për kthesat e Llogarasë
                - Makinë automatike nëse nuk je mësuar me rrugë malore
                - Sigurim i plotë: rrugët janë të ngushta në disa pjesë

                Rezervo të paktën 3 ditë që ta shijosh Rivierën pa nxitim.
                """, now.minus(9, ChronoUnit.DAYS)),
            post("Çfarë dokumentesh të duhen për të marrë makinë me qira në Shqipëri",
                "Këshilla",
                "Patenta, mosha, depozita dhe dokumentet për të huajt — gjithçka që duhet të kesh gati në momentin e marrjes.",
                "https://commons.wikimedia.org/wiki/Special:FilePath/Volkswagen_Golf_VIII_Facelift_IMG_0375.jpg?width=1280",
                """
                Rezervimi në Bookers Car Albania bëhet pa llogari, por kur merr makinën kompania do të kërkojë disa dokumente.

                ## Dokumentet bazë
                - Patentë e vlefshme (të paktën 1 vit)
                - Kartë identiteti ose pasaportë
                - Kodi i rezervimit (p.sh. BCA-2026-0001)

                ## Mosha
                Shoferi duhet të jetë 21 deri 75 vjeç. Disa kompani kërkojnë 25 vjeç për makinat luksoze.

                ## Për shtetasit e huaj
                Patentat e BE-së pranohen direkt. Për vendet e tjera, këshillohet patenta ndërkombëtare.

                ## Pagesa
                Pagesa bëhet te kompania në momentin e marrjes. Çmimi që sheh në rezervim është totali final.

                ## Anulimi
                Anulimi është falas brenda 24 orëve nga rezervimi. E bën vetë te "Rezervimi im" me kodin dhe telefonin.
                """, now.minus(5, ChronoUnit.DAYS)),
            post("Hibride apo naftë? Si të kursesh karburant me makinë me qira",
                "Këshilla",
                "Krahasim i thjeshtë i konsumit dhe disa truke që ta ulin faturën e karburantit gjatë pushimeve.",
                "https://commons.wikimedia.org/wiki/Special:FilePath/Toyota_Yaris_Hybrid_(XP210)_1X7A0353.jpg?width=1280",
                """
                Karburanti është shpesh shpenzimi i dytë më i madh pas qirasë. Zgjedhja e makinës së duhur bën diferencë.

                ## Hibride
                Ideale për qytet dhe trafik. Toyota Yaris Hybrid ose Corolla Hybrid harxhojnë rreth 4–5 litra për 100 km.

                ## Naftë
                Më e mirë për rrugë të gjata dhe autostradë, si Tiranë–Vlorë. Konsum i ulët me shpejtësi të qëndrueshme.

                ## Truke për të kursyer
                - Mbush rezervuarin larg aeroportit, çmimet janë më të ulëta
                - Mos mbaj kondicionerin në maksimum me dritare hapur
                - Kontrollo presionin e gomave në marrje
                - Rezervo 7+ ditë dhe përfito 10% zbritje

                Te faqja "Makinat" mund të filtrosh sipas karburantit dhe kutisë së shpejtësisë.
                """, now.minus(2, ChronoUnit.DAYS))
        );
        repository.saveAll(posts);
        log.info("U shtuan {} artikuj fillestarë në blog.", posts.size());
    }

    private static BlogPost post(String title, String category, String excerpt, String image, String content,
                                 Instant publishedAt) {
        BlogPost p = new BlogPost();
        p.setTitle(title);
        p.setSlug(BlogService.slugify(title));
        p.setCategory(category);
        p.setExcerpt(excerpt);
        p.setCoverImageUrl(image);
        p.setContent(content.strip());
        p.setPublished(true);
        p.setPublishedAt(publishedAt);
        return p;
    }
}
