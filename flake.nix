{
  description = "stream-note development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            nodejs_22
            typescript
          ];

          shellHook = ''
            echo "stream-note dev shell"
            echo "Bun: $(bun --version)"
            echo "Node: $(node --version)"
          '';
        };
      }
    );
}
