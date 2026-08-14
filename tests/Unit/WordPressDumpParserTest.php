<?php

namespace Tests\Unit;

use App\Import\WordPress\WordPressDumpParser;
use PHPUnit\Framework\TestCase;

class WordPressDumpParserTest extends TestCase
{
    public function test_it_parses_basic_posts_and_meta_from_a_dump(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'wpdump');
        file_put_contents($path, <<<SQL
CREATE TABLE `wp_d4c592_posts` (
  `ID` bigint(20) unsigned NOT NULL,
  `post_title` text NOT NULL,
  `post_name` varchar(200) NOT NULL,
  `post_status` varchar(20) NOT NULL,
  `post_type` varchar(20) NOT NULL,
  `post_excerpt` longtext NOT NULL,
  `post_content` longtext NOT NULL,
  `post_mime_type` varchar(100) NOT NULL
);
INSERT INTO `wp_d4c592_posts` (`ID`, `post_title`, `post_name`, `post_status`, `post_type`, `post_excerpt`, `post_content`, `post_mime_type`) VALUES
(1,'Casa Teste','casa-teste','publish','imoveis','','Conteúdo',''),
(2,'Imagem','imagem-teste','inherit','attachment','','','image/jpeg');
INSERT INTO `wp_d4c592_postmeta` (`meta_id`, `post_id`, `meta_key`, `meta_value`) VALUES
(1,1,'preco','100000'),
(2,1,'_thumbnail_id','2');
INSERT INTO `wp_d4c592_term_taxonomy` (`term_taxonomy_id`, `term_id`, `taxonomy`) VALUES
(1,10,'category');
INSERT INTO `wp_d4c592_terms` (`term_id`, `name`, `slug`) VALUES
(10,'Categoria','categoria');
SQL);

        $dump = (new WordPressDumpParser)->parse($path, 'wp_d4c592_');

        $this->assertCount(2, $dump->posts);
        $this->assertCount(2, $dump->attachments);
        $this->assertSame(1, $dump->postTypeCounts['imoveis']);
        $this->assertSame(1, $dump->postTypeCounts['attachment']);
        $this->assertCount(2, $dump->postmeta);
        $this->assertCount(1, $dump->termTaxonomy);
        $this->assertCount(1, $dump->terms);

        @unlink($path);
    }
}
