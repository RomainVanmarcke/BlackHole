using Constellation;
using Constellation.Package;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace BlackMenu
{
    public class Program : PackageBase
    {
        static void Main(string[] args)
        {
            PackageHost.Start<Program>(args);            
        }

        public override void OnStart()
        {
            PackageHost.PushStateObject("Movements", new { Flat = false, Left = false, Right = false, Down = false });
            this.Acc.ValueChanged += (s, e) =>
            {
                if (Acc.DynamicValue.State == true)
                {
                    double x = (Acc.DynamicValue.X);
                    double y = (Acc.DynamicValue.Y);
                    double z = (Acc.DynamicValue.Z);
                    double xabs = Math.Abs(x);
                    double yabs = Math.Abs(y);
                    double zabs = Math.Abs(z);

                    // Movements vers le bas
                    if (xabs < 5 && yabs < 2 && z < -8)
                    {
                        PackageHost.PushStateObject("Movements", new { Flat = false, Left = false, Right = false, Down = true });
                    }
                    // Movements mise a plat
                    else if (xabs < 5 && yabs < 2 && z > 8)
                    {
                        PackageHost.PushStateObject("Movements", new { Flat = true, Left = false, Right = false, Down = false });
                    }
                    // Movements quart gauche
                    else if (x > 5 && y < 6 && zabs < 4)
                    {
                        PackageHost.PushStateObject("Movements", new { Flat = false, Left = true, Right = false, Down = false });
                    }
                    // Movements quart droit
                    else if (x < (-5) && y < 6 && zabs < 4)
                    {
                        PackageHost.PushStateObject("Movements", new { Flat = false, Left = false, Right = true, Down = false });
                    }
                    else
                    {
                        PackageHost.PushStateObject("Movements", new { Flat = false, Left = false, Right = false, Down = false });
                    }
                }
            };
        }


        [StateObjectLink("BlackConnector", "accelerometer")]
        private StateObjectNotifier Acc { get; set; }
    }
}
