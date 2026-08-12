<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Condominium;
use App\Models\BlogPost;
use App\Models\Lead;
use App\Models\Page;
use App\Models\Property;
use App\Models\Subdivision;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'counts' => ['properties' => Property::count(), 'condominiums' => Condominium::count(), 'subdivisions' => Subdivision::count(), 'posts' => BlogPost::count(), 'pages' => Page::count(), 'leads' => Lead::count(), 'newLeads' => Lead::where('status', 'new')->count()],
            'statusCounts' => ['published' => Property::where('status','published')->count()+Condominium::where('status','published')->count()+Subdivision::where('status','published')->count(), 'draft' => Property::where('status','draft')->count()+Condominium::where('status','draft')->count()+Subdivision::where('status','draft')->count(), 'featured' => Property::where('featured',true)->count()+Condominium::where('featured',true)->count()+Subdivision::where('featured',true)->count()],
            'recentLeads' => Lead::with(['property','condominium','subdivision'])->latest()->limit(6)->get(),
            'recentPosts' => BlogPost::latest()->limit(5)->get(['id','title','slug','status','updated_at']),
        ]);
    }
}
