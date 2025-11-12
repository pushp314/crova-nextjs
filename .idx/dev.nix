/* FILE: .idx/dev.nix */
# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
    # Add the PostgreSQL package
    pkgs.postgresql
  ];
  # Sets environment variables in the workspace
  env = {
    # Set the DATABASE_URL for Prisma to connect to the new service
    DATABASE_URL = "postgres://postgres:postgres@localhost:5432/nova_db";
  };
  # This adds a file watcher to startup the firebase emulators.
  services.firebase.emulators = {
    # Disabling because we are using prod backends right now
    detect = false;
    projectId = "demo-app";
    services = ["auth" "firestore"];
  };

  # Add this new service to start PostgreSQL
  services.postgres = {
    enable = true;
    # Creates a user "postgres" with password "postgres"
    # and a database named "nova_db"
    initialDatabases = [{
      name = "nova_db";
      user = "postgres";
      password = "postgres";
    }];
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
      # Recommended for Prisma
      "prisma.prisma"
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
        # Automatically run prisma generate and push the schema on startup
        db-setup = {
          command = "npm install && npx prisma generate && npx prisma db push && npm run db:seed";
        };
      };
      # Open the database port for access
      ports = {
        "postgres-db" = {
          port = 5432;
          onOpen = "ignore";
        };
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}