@extends('layouts.admin')

@section('title')
    Administration Overview
@endsection

@section('content-header')
    <h1>System Dashboard<small>Real-time telemetry and management overview</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Overview</li>
    </ol>
@endsection

@section('content')
{{-- Bento Stat Cards --}}
<div class="row">
    <div class="col-xs-12 col-sm-6 col-md-3">
        <div class="box" style="position: relative; overflow: hidden; border-left: 3px solid #38bdf8 !important;">
            <div class="box-body" style="padding: 22px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;">Servers</span>
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(14, 165, 233, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; color: #38bdf8;">
                        <i class="fa fa-server" style="font-size: 16px;"></i>
                    </div>
                </div>
                <div style="font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.1; margin-bottom: 8px;">
                    {{ $serversCount ?? 0 }}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 12px; color: #64748b;">Deployed Instances</span>
                    <a href="{{ route('admin.servers') }}" style="font-size: 12px; font-weight: 600; color: #38bdf8; text-decoration: none;">Manage &rarr;</a>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-sm-6 col-md-3">
        <div class="box" style="position: relative; overflow: hidden; border-left: 3px solid #10b981 !important;">
            <div class="box-body" style="padding: 22px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;">Nodes</span>
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: center; color: #34d399;">
                        <i class="fa fa-sitemap" style="font-size: 16px;"></i>
                    </div>
                </div>
                <div style="font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.1; margin-bottom: 8px;">
                    {{ $nodesCount ?? 0 }}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 12px; color: #64748b;">Wings Daemons</span>
                    <a href="{{ route('admin.nodes') }}" style="font-size: 12px; font-weight: 600; color: #34d399; text-decoration: none;">Manage &rarr;</a>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-sm-6 col-md-3">
        <div class="box" style="position: relative; overflow: hidden; border-left: 3px solid #818cf8 !important;">
            <div class="box-body" style="padding: 22px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;">Users</span>
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(129, 140, 248, 0.15); border: 1px solid rgba(129, 140, 248, 0.3); display: flex; align-items: center; justify-content: center; color: #818cf8;">
                        <i class="fa fa-users" style="font-size: 16px;"></i>
                    </div>
                </div>
                <div style="font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.1; margin-bottom: 8px;">
                    {{ $usersCount ?? 0 }}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 12px; color: #64748b;">Registered Accounts</span>
                    <a href="{{ route('admin.users') }}" style="font-size: 12px; font-weight: 600; color: #818cf8; text-decoration: none;">Manage &rarr;</a>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-sm-6 col-md-3">
        <div class="box" style="position: relative; overflow: hidden; border-left: 3px solid #f59e0b !important;">
            <div class="box-body" style="padding: 22px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;">Databases</span>
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: center; color: #fbbf24;">
                        <i class="fa fa-database" style="font-size: 16px;"></i>
                    </div>
                </div>
                <div style="font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.1; margin-bottom: 8px;">
                    {{ $databasesCount ?? 0 }}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 12px; color: #64748b;">Active Databases</span>
                    <a href="{{ route('admin.databases') }}" style="font-size: 12px; font-weight: 600; color: #fbbf24; text-decoration: none;">Manage &rarr;</a>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Quick Actions Row --}}
<div class="row">
    <div class="col-xs-12">
        <div class="box" style="padding: 16px 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;">
            <span style="font-size: 14px; font-weight: 700; color: #ffffff;">Quick Operations</span>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                <a href="{{ route('admin.servers.new') }}" class="btn btn-primary btn-sm">
                    <i class="fa fa-plus-circle" style="margin-right: 5px;"></i> Create Server
                </a>
                <a href="{{ route('admin.nodes.new') }}" class="btn btn-success btn-sm">
                    <i class="fa fa-plus" style="margin-right: 5px;"></i> Add Node
                </a>
                <a href="{{ route('admin.users.new') }}" class="btn btn-default btn-sm">
                    <i class="fa fa-user-plus" style="margin-right: 5px;"></i> Add User
                </a>
                <a href="{{ route('admin.settings') }}" class="btn btn-default btn-sm">
                    <i class="fa fa-cog" style="margin-right: 5px;"></i> System Settings
                </a>
            </div>
        </div>
    </div>
</div>

{{-- System Telemetry & Information --}}
<div class="row">
    <div class="col-xs-12 col-md-7">
        <div class="box @if($version->isLatestPanel()) box-success @else box-danger @endif">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-info-circle" style="color: #38bdf8; margin-right: 6px;"></i> System &amp; Engine Status</h3>
            </div>
            <div class="box-body">
                @if ($version->isLatestPanel())
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); margin-bottom: 16px;">
                        <i class="fa fa-check-circle" style="color: #10b981; font-size: 24px;"></i>
                        <div>
                            <strong style="color: #a7f3d0; font-size: 14px;">Your system is fully up-to-date!</strong>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">Running Timo X Panel release <code>{{ config('app.version') }}</code>.</p>
                        </div>
                    </div>
                @else
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); margin-bottom: 16px;">
                        <i class="fa fa-exclamation-triangle" style="color: #ef4444; font-size: 24px;"></i>
                        <div>
                            <strong style="color: #fecaca; font-size: 14px;">Update Available!</strong>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                Latest release is <a href="https://github.com/Pterodactyl/Panel/releases/v{{ $version->getPanel() }}" target="_blank"><code>{{ $version->getPanel() }}</code></a>. Running <code>{{ config('app.version') }}</code>.
                            </p>
                        </div>
                    </div>
                @endif

                <table class="table" style="font-size: 13px;">
                    <tbody>
                        <tr>
                            <td style="width: 40%; color: #94a3b8;">PHP Version</td>
                            <td><code>{{ phpversion() }}</code></td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8;">Laravel Framework</td>
                            <td><code>{{ app()->version() }}</code></td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8;">Environment</td>
                            <td><span class="label label-info">{{ strtoupper(config('app.env')) }}</span></td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8;">Server Timezone</td>
                            <td><code>{{ config('app.timezone') }}</code> ({{ date('Y-m-d H:i:s') }})</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="col-xs-12 col-md-5">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title"><i class="fa fa-life-ring" style="color: #38bdf8; margin-right: 6px;"></i> Community &amp; Resources</h3>
            </div>
            <div class="box-body" style="display: flex; flex-direction: column; gap: 10px;">
                <a href="{{ $version->getDiscord() }}" target="_blank" class="btn btn-warning" style="text-align: left; padding: 12px 16px;">
                    <i class="fa fa-fw fa-comments" style="margin-right: 8px;"></i> Join Official Discord Community
                </a>
                <a href="https://pterodactyl.io" target="_blank" class="btn btn-primary" style="text-align: left; padding: 12px 16px;">
                    <i class="fa fa-fw fa-book" style="margin-right: 8px;"></i> Official Documentation &amp; Guides
                </a>
                <a href="https://github.com/pterodactyl/panel" target="_blank" class="btn btn-default" style="text-align: left; padding: 12px 16px;">
                    <i class="fa fa-fw fa-github" style="margin-right: 8px;"></i> GitHub Open Source Repository
                </a>
                <a href="{{ $version->getDonations() }}" target="_blank" class="btn btn-success" style="text-align: left; padding: 12px 16px;">
                    <i class="fa fa-fw fa-heart" style="margin-right: 8px;"></i> Support Timo X Panel Development
                </a>
            </div>
        </div>
    </div>
</div>
@endsection

