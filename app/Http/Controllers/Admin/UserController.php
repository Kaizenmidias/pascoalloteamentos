<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response { return Inertia::render('Admin/Users/Index',['items'=>User::latest()->paginate(20)]); }
    public function create(): Response { return Inertia::render('Admin/Users/Form',['item'=>null]); }
    public function edit(User $user): Response { return Inertia::render('Admin/Users/Form',['item'=>$user]); }
    public function store(Request $request): RedirectResponse { $user=new User; $this->save($request,$user); return redirect()->route('admin.users.edit',$user)->with('success','Usuário criado.'); }
    public function update(Request $request, User $user): RedirectResponse { $this->save($request,$user); return back()->with('success','Usuário atualizado.'); }
    public function destroy(Request $request, User $user): RedirectResponse { abort_if($request->user()->is($user),422,'Você não pode remover seu próprio usuário.'); $user->delete(); return back()->with('success','Usuário removido.'); }
    private function save(Request $request, User $user): void { $data=$request->validate(['name'=>'required|string|max:255','username'=>['required','alpha_dash:ascii','max:100',Rule::unique('users')->ignore($user)],'email'=>['required','email','max:255',Rule::unique('users')->ignore($user)],'password'=>[$user->exists?'nullable':'required','string','min:8','confirmed'],'role'=>['required',Rule::in(['admin','editor'])],'is_active'=>'boolean']); if(empty($data['password'])) unset($data['password']); $user->fill($data)->save(); }
}
