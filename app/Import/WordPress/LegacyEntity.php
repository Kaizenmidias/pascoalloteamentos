<?php

namespace App\Import\WordPress;

enum LegacyEntity: string
{
    case Property = 'property';
    case Condominium = 'condominium';
    case Subdivision = 'subdivision';
    case Page = 'page';
    case BlogPost = 'blog_post';
    case Feature = 'feature';
    case Ignore = 'ignore';
    case Review = 'review';
}
