<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Helpers\SoftwareVersionService;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Database;

class BaseController extends Controller
{
    /**
     * BaseController constructor.
     */
    public function __construct(private SoftwareVersionService $version)
    {
    }

    /**
     * Return the admin index view.
     */
    public function index(): View
    {
        return view('admin.index', [
            'version' => $this->version,
            'serversCount' => Server::count(),
            'nodesCount' => Node::count(),
            'usersCount' => User::count(),
            'databasesCount' => Database::count(),
        ]);
    }
}
